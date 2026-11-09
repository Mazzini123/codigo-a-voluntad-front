import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";

const CLAVE = "codigo-a-voluntad:sesion-simulada";
const CLAVE_PERFIL = "codigo-a-voluntad:sesion-simulada:perfil";

const CUENTAS = {
  COLECTIVO: {
    id: "cuenta-simulada",
    rol: ROL_CUENTA.COLECTIVO,
    perfilId: "colectivo-simulado",
  },
  COLABORADORA: {
    id: "cuenta-simulada",
    rol: ROL_CUENTA.COLABORADORA,
    perfilId: "colaboradora-simulada",
  },
  SIN_PERFIL: { id: "cuenta-simulada", rol: null, perfilId: null },
};

export const ETIQUETAS_SIMULADAS = {
  COLECTIVO: "Colectivo",
  COLABORADORA: "Colaboradora",
  SIN_PERFIL: "Sin perfil",
};

export function leerSesionSimulada(valor) {
  const tipo = valor?.trim().toUpperCase();
  if (!tipo) return null;
  if (CUENTAS[tipo]) return tipo;
  console.warn(
    `VITE_SESION_SIMULADA="${valor}" no es válida (COLECTIVO, COLABORADORA o SIN_PERFIL). Se ignora.`,
  );
  return null;
}

export function sesionSimuladaActiva(entorno) {
  if (!entorno.DEV || entorno.MODE === "test") return null;
  if (entorno.MODE === "demo") return "COLECTIVO";
  return leerSesionSimulada(entorno.VITE_SESION_SIMULADA);
}

export function tieneSesion() {
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

const oyentes = new Set();

export function suscribirseALaSesion(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function recordarSesion(activa) {
  try {
    if (activa) sessionStorage.setItem(CLAVE, "1");
    else {
      sessionStorage.removeItem(CLAVE);
      sessionStorage.removeItem(CLAVE_PERFIL);
    }
  } catch {
    return;
  } finally {
    oyentes.forEach((oyente) => oyente());
  }
}

function perfilAsociado() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_PERFIL)) ?? null;
  } catch {
    return null;
  }
}

export function asociarPerfilSimulado(rol, perfilId) {
  sessionStorage.setItem(CLAVE_PERFIL, JSON.stringify({ rol, perfilId }));
}

export function crearAuthHttpClientSimulado(tipo, perfilId) {
  return {
    async obtenerCuentaActual() {
      const asociado = perfilAsociado();
      if (asociado) return { ...CUENTAS[tipo], ...asociado };
      const cuenta = { ...CUENTAS[tipo] };
      if (perfilId && cuenta.rol) cuenta.perfilId = perfilId;
      return cuenta;
    },
  };
}
