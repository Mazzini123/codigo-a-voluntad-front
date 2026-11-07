import axios from "axios";
import { ApiError } from "./ApiError.js";
import { describirError, esDemora } from "./mensajesDeError.js";
import { avisarSesionVencida, obtenerTokenActual } from "./configurarAuth.js";

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

async function agregarToken(config) {
  const token = await obtenerTokenActual();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
}

function aApiError(error) {
  if (error.response?.status === 401) avisarSesionVencida();
  const data = error.response?.data;
  return new ApiError({
    status: error.response?.status ?? null,
    ...describirError(error),
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

  cliente.interceptors.response.use(undefined, async (error) => {
    if (axios.isCancel(error)) throw error;
    const intentos = error.config?.intentosRealizados ?? 0;
    if (debeReintentar(error, intentos, reintentos)) {
      await esperar(esperaBaseMs * 2 ** intentos, error.config.signal);
      return cliente.request({ ...error.config, intentosRealizados: intentos + 1 });
    }
    throw aApiError(error);
  });

  return cliente;
}

export const axiosClient = crearAxiosClient();
