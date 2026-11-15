import { ErrorDeIngreso } from "./ErrorDeIngreso.js";

export const MENSAJE_SIN_CONFIGURAR =
  "No pudimos iniciar el ingreso. Probá de nuevo más tarde.";
const DETALLE_SIN_CONFIGURAR =
  "El ingreso no está configurado. Completá las variables VITE_LOGTO_* o usá VITE_SESION_SIMULADA (ver README).";

export function avisarSinConfigurar() {
  console.warn(DETALLE_SIN_CONFIGURAR);
}

const SESION_SIN_CONFIGURAR = {
  sinConfigurar: true,
  autenticado: false,
  cargando: false,
  error: null,
  async iniciar() {
    avisarSinConfigurar();
    throw new ErrorDeIngreso(MENSAJE_SIN_CONFIGURAR);
  },
  async cerrar() {},
  async limpiar() {},
  obtenerToken: async () => null,
};

export function useSesionSinConfigurar() {
  return SESION_SIN_CONFIGURAR;
}
