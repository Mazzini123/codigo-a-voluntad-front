import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";

const CLAVE = "codigo-a-voluntad:sesion-simulada";
const CLAVE_PERFIL = "codigo-a-voluntad:sesion-simulada:perfil";
let cuentaSinPersistir = null;

const CONTEXTO_DE_ADMINISTRACION = {
  id: "contexto-administracion-simulado",
  tipo: TIPO_CONTEXTO.ADMINISTRACION,
  rol: "ADMIN",
  colectivo: null,
  colaborador: null,
  permisos: [
    PERMISO.PROYECTO_DESTACAR,
    PERMISO.REVISION_VER,
    PERMISO.REVISION_RESOLVER,
    PERMISO.AUDITORIA_VER,
    PERMISO.ADMIN_GESTIONAR,
  ],
};

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
  ADMINISTRACION: {
    id: "cuenta-simulada",
    rol: ROL_CUENTA.ADMINISTRACION,
    perfilId: null,
    contextoActual: CONTEXTO_DE_ADMINISTRACION,
    contextos: [CONTEXTO_DE_ADMINISTRACION],
  },
};

export const ETIQUETAS_SIMULADAS = {
  COLECTIVO: "Colectivo",
  COLABORADORA: "Colaboradora",
  SIN_PERFIL: "Sin perfil",
  ADMINISTRACION: "Administración",
};

export function leerSesionSimulada(valor) {
  const tipo = valor?.trim().toUpperCase();
  if (!tipo) return null;
  if (CUENTAS[tipo]) return tipo;
  console.warn(
    `VITE_SESION_SIMULADA="${valor}" no es válida (COLECTIVO, COLABORADORA, ADMINISTRACION o SIN_PERFIL). Se ignora.`,
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
  if (!activa) cuentaSinPersistir = null;
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
  if (cuentaSinPersistir) return cuentaSinPersistir;
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_PERFIL)) ?? null;
  } catch {
    return null;
  }
}

export function recordarCuentaSimulada(rol, perfilId) {
  const cuenta = { rol, perfilId };
  try {
    sessionStorage.setItem(CLAVE_PERFIL, JSON.stringify(cuenta));
    cuentaSinPersistir = null;
  } catch {
    // Un fallo local no puede convertir un alta confirmada en un alta fallida.
    cuentaSinPersistir = cuenta;
  }
}

const CLAVE_NOMBRE = "codigo-a-voluntad:sesion-simulada:nombre";

function nombreSimulado() {
  try {
    return sessionStorage.getItem(CLAVE_NOMBRE) ?? "Persona de prueba";
  } catch {
    return "Persona de prueba";
  }
}

export function crearAuthHttpClientSimulado(tipo, perfilId) {
  return {
    async obtenerCuentaActual() {
      const asociado = perfilAsociado();
      const cuenta = asociado ? { ...CUENTAS[tipo], ...asociado } : { ...CUENTAS[tipo] };
      if (!asociado && perfilId && cuenta.rol) cuenta.perfilId = perfilId;
      return {
        ...cuenta,
        usuario: { id: cuenta.id, nombre: nombreSimulado(), nombrePendiente: false },
      };
    },
    async registrarUsuario() {
      return { creado: false };
    },
    async cambiarNombre({ nombre }) {
      sessionStorage.setItem(CLAVE_NOMBRE, nombre);
      return { nombre };
    },
    async seleccionarContexto() {
      return null;
    },
    async limpiarContexto() {
      return null;
    },
    async listarMisSolicitudes() {
      return [];
    },
  };
}
