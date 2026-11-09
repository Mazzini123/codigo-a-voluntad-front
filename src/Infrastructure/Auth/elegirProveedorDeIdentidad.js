import { ErrorDeIngreso } from "./ErrorDeIngreso.js";
import { crearIdentidadSimulada, sesionSimuladaActiva } from "./sesionSimulada.js";

export const MENSAJE_SIN_CONFIGURAR =
  "No pudimos iniciar el ingreso. Probá de nuevo más tarde.";
const DETALLE_SIN_CONFIGURAR =
  "El ingreso no está configurado. Completá las variables VITE_LOGTO_* o usá VITE_SESION_SIMULADA (ver README).";

export const PROVEEDOR_DE_IDENTIDAD = Object.freeze({
  LOGTO: "logto",
  SIMULADA: "simulada",
  SIN_CONFIGURAR: "sinConfigurar",
});

export function crearIdentidadSinConfigurar() {
  const fallar = () => {
    console.warn(DETALLE_SIN_CONFIGURAR);
    throw new ErrorDeIngreso(MENSAJE_SIN_CONFIGURAR);
  };
  return {
    sinConfigurar: true,
    estaAutenticado: async () => false,
    iniciarSesion: async () => fallar(),
    completarIngreso: async () => fallar(),
    obtenerToken: async () => null,
    async cerrarSesion() {},
    async olvidarSesion() {},
  };
}

function logtoConfigurado(entorno) {
  return Boolean(
    entorno.VITE_LOGTO_ENDPOINT &&
    entorno.VITE_LOGTO_APP_ID &&
    entorno.VITE_LOGTO_RECURSO,
  );
}

export function elegirProveedorDeIdentidad(entorno) {
  const simulada = sesionSimuladaActiva(entorno);
  if (simulada) {
    console.warn(`Sesión simulada (${simulada}): no se usa Logto ni GET /auth/me.`);
    return {
      tipo: PROVEEDOR_DE_IDENTIDAD.SIMULADA,
      identidad: crearIdentidadSimulada(simulada),
    };
  }
  if (logtoConfigurado(entorno) && entorno.MODE !== "test") {
    return { tipo: PROVEEDOR_DE_IDENTIDAD.LOGTO };
  }
  if (entorno.DEV && entorno.MODE !== "test") console.warn(DETALLE_SIN_CONFIGURAR);
  return {
    tipo: PROVEEDOR_DE_IDENTIDAD.SIN_CONFIGURAR,
    identidad: crearIdentidadSinConfigurar(),
  };
}
