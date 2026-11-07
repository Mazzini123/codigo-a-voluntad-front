const CLAVE = "codigo-a-voluntad:sesion-simulada";
const CLAVE_PERFIL = "codigo-a-voluntad:sesion-simulada:perfil";

const CUENTAS = {
  COLECTIVO: { id: "cuenta-simulada", rol: "COLECTIVO", perfilId: "colectivo-simulado" },
  COLABORADORA: {
    id: "cuenta-simulada",
    rol: "COLABORADORA",
    perfilId: "colaboradora-simulada",
  },
  SIN_PERFIL: { id: "cuenta-simulada", rol: null, perfilId: null },
};

const ETIQUETAS = {
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

function tieneSesion() {
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}

function recordarSesion(activa) {
  try {
    if (activa) sessionStorage.setItem(CLAVE, "1");
    else {
      sessionStorage.removeItem(CLAVE);
      sessionStorage.removeItem(CLAVE_PERFIL);
    }
  } catch {
    return;
  }
}

function perfilAsociado() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_PERFIL)) ?? null;
  } catch {
    return null;
  }
}

function asociarPerfilSimulado(rol, perfilId) {
  try {
    sessionStorage.setItem(CLAVE_PERFIL, JSON.stringify({ rol, perfilId }));
  } catch {
    return;
  }
}

/** @returns {import('./identidad.js').Identidad & { simulada: string }} */
export function crearIdentidadSimulada(tipo, ubicacion = window.location) {
  return {
    simulada: ETIQUETAS[tipo],
    estaAutenticado: async () => tieneSesion(),
    async iniciarSesion() {
      recordarSesion(true);
      ubicacion.assign("/callback");
    },
    async completarIngreso() {
      recordarSesion(true);
    },
    obtenerToken: async () => null,
    async cerrarSesion() {
      recordarSesion(false);
      ubicacion.assign("/");
    },
    async olvidarSesion() {
      recordarSesion(false);
    },
    async asociarPerfil(rol, perfilId) {
      asociarPerfilSimulado(rol, perfilId);
    },
  };
}

/** @returns {import('../../Application/Domain/HttpClients/IAuthHttpClient.js').IAuthHttpClient} */
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
