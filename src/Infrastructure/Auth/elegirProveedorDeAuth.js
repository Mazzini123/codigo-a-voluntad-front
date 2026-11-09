import { sesionSimuladaActiva } from "./sesionSimulada.js";

export const PROVEEDOR_DE_AUTH = Object.freeze({
  LOGTO: "logto",
  SIMULADA: "simulada",
  SIN_CONFIGURAR: "sinConfigurar",
});

const SOPORTADOS = new Set([PROVEEDOR_DE_AUTH.LOGTO, PROVEEDOR_DE_AUTH.SIMULADA]);

function logtoConfigurado(entorno) {
  return Boolean(
    entorno.VITE_LOGTO_ENDPOINT &&
    entorno.VITE_LOGTO_APP_ID &&
    entorno.VITE_LOGTO_API_RESOURCE,
  );
}

export function elegirProveedorDeAuth(entorno) {
  const pedido = entorno.VITE_AUTH_PROVIDER || PROVEEDOR_DE_AUTH.LOGTO;
  if (!SOPORTADOS.has(pedido)) {
    throw new Error(`Proveedor de autenticación no soportado: ${pedido}`);
  }
  const simulada = sesionSimuladaActiva(entorno);
  if (simulada) {
    console.warn(`Sesión simulada (${simulada}): no se usa Logto ni GET /auth/me.`);
    return { tipo: PROVEEDOR_DE_AUTH.SIMULADA, simulada };
  }
  if (
    pedido === PROVEEDOR_DE_AUTH.LOGTO &&
    logtoConfigurado(entorno) &&
    entorno.MODE !== "test"
  ) {
    return { tipo: PROVEEDOR_DE_AUTH.LOGTO };
  }
  return { tipo: PROVEEDOR_DE_AUTH.SIN_CONFIGURAR };
}
