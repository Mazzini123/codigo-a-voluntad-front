export const MENSAJE_SIN_CONFIGURAR =
  "No pudimos iniciar el ingreso. Probá de nuevo más tarde.";
const DETALLE_SIN_CONFIGURAR =
  "El ingreso no está configurado. Completá las variables VITE_LOGTO_* o usá VITE_SESION_SIMULADA (ver README).";

/** @returns {import('./identidad.js').Identidad} */
export function crearIdentidadSinConfigurar() {
  return {
    sinConfigurar: true,
    estaAutenticado: async () => false,
    async iniciarSesion() {
      console.warn(DETALLE_SIN_CONFIGURAR);
      const error = new Error(MENSAJE_SIN_CONFIGURAR);
      error.mensaje = MENSAJE_SIN_CONFIGURAR;
      throw error;
    },
    async completarIngreso() {
      console.warn(DETALLE_SIN_CONFIGURAR);
      throw new Error(MENSAJE_SIN_CONFIGURAR);
    },
    obtenerToken: async () => null,
    async cerrarSesion() {},
    async olvidarSesion() {},
  };
}

export function crearIdentidad(entorno) {
  const configurado =
    entorno.VITE_LOGTO_ENDPOINT &&
    entorno.VITE_LOGTO_APP_ID &&
    entorno.VITE_LOGTO_RECURSO;
  if (!configurado || entorno.MODE === "test") {
    if (entorno.DEV && entorno.MODE !== "test") {
      console.warn(DETALLE_SIN_CONFIGURAR);
    }
    return crearIdentidadSinConfigurar();
  }
  return null;
}
