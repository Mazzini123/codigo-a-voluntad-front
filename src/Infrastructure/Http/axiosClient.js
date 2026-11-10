import axios from "axios";
import { ApiError } from "./ApiError.js";
import { describirError, esDemora } from "./mensajesDeError.js";
import {
  avisarContextoDesactualizado,
  avisarSesionVencida,
  sesionHttpActual,
  sesionHttpVigente,
} from "./configurarAuth.js";
import { CODIGOS_DE_CONTEXTO } from "@/Application/Domain/Enums/CODIGO_ERROR.js";

const ENCABEZADO_DE_CONTEXTO = "X-Context-Id";

function esperar(ms, signal) {
  return new Promise((resolve, reject) => {
    const cancelar = () => {
      clearTimeout(temporizador);
      reject(new axios.CanceledError());
    };
    const temporizador = setTimeout(() => {
      signal?.removeEventListener("abort", cancelar);
      resolve();
    }, ms);
    if (signal?.aborted) cancelar();
    else signal?.addEventListener("abort", cancelar, { once: true });
  });
}

function debeReintentar(error, intentos, maximo) {
  const config = error.config;
  if (!config || config.method?.toLowerCase() !== "get") return false;
  if (error.response) return false;
  if (error.code !== "ERR_NETWORK" && !esDemora(error)) return false;
  return intentos < maximo;
}

function verificarSesionDelPedido(config) {
  const generacion = config?.sesionHttpDelPedido;
  if (generacion !== undefined && !sesionHttpVigente(generacion)) {
    throw new axios.CanceledError("La sesión del pedido cambió", config);
  }
}

async function agregarToken(config) {
  verificarSesionDelPedido(config);
  const sesion = sesionHttpActual();
  if (config.bearerDeSesion) {
    config.headers.delete("Authorization");
    config.headers.delete(ENCABEZADO_DE_CONTEXTO);
  }
  config.bearerDeSesion = false;
  if (config.intentosRealizados && config.sesionHttpDelPedido === undefined)
    return config;

  let token;
  let permitidoSinToken = false;
  let cause;
  try {
    if (sesion.habilitada) {
      token = await sesion.obtenerToken();
      if (!token && config.requiereSesion)
        permitidoSinToken = await sesion.permiteSinToken();
    }
  } catch (error) {
    cause = error;
  }

  verificarSesionDelPedido(config);
  if (!sesionHttpVigente(sesion.generacion)) {
    if (config.requiereSesion) {
      throw new axios.CanceledError("La sesión del pedido cambió", config);
    }
    return config;
  }
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
    const contextoId = sesion.obtenerContextoId();
    if (contextoId) config.headers.set(ENCABEZADO_DE_CONTEXTO, contextoId);
    config.bearerDeSesion = true;
  } else if (config.requiereSesion && !permitidoSinToken) {
    throw new ApiError({
      mensaje:
        "No pudimos verificar tu sesión para completar esta acción. Probá de nuevo.",
      esReintentable: true,
      cause,
    });
  }
  if (token || config.requiereSesion) config.sesionHttpDelPedido = sesion.generacion;
  return config;
}

function aApiError(error) {
  const sesionVencida =
    error.response?.status === 401 &&
    error.config?.bearerDeSesion &&
    avisarSesionVencida(error.config.sesionHttpDelPedido);
  const data = error.response?.data;
  const codigo = data?.codigo ?? null;
  if (CODIGOS_DE_CONTEXTO.includes(codigo) && error.config?.bearerDeSesion) {
    avisarContextoDesactualizado(error.config.sesionHttpDelPedido);
  }
  return new ApiError({
    status: error.response?.status ?? null,
    codigo,
    ...describirError(error, { sesionVencida }),
    issues: Array.isArray(data?.issues) ? data.issues : [],
    cause: error,
  });
}

export function crearAxiosClient({ reintentos = 2, esperaBaseMs = 300 } = {}) {
  const cliente = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: 10000,
    headers: { Accept: "application/json" },
  });

  cliente.interceptors.request.use(agregarToken);

  cliente.interceptors.response.use(
    (response) => {
      if (response.config?.requiereSesion) verificarSesionDelPedido(response.config);
      return response;
    },
    async (error) => {
      if (axios.isCancel(error) || error instanceof ApiError) throw error;
      verificarSesionDelPedido(error.config);
      const intentos = error.config?.intentosRealizados ?? 0;
      if (debeReintentar(error, intentos, reintentos)) {
        await esperar(esperaBaseMs * 2 ** intentos, error.config.signal);
        return cliente.request({ ...error.config, intentosRealizados: intentos + 1 });
      }
      throw aApiError(error);
    },
  );

  return cliente;
}

export const axiosClient = crearAxiosClient();
