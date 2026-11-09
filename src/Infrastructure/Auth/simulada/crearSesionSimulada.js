import { useSyncExternalStore } from "react";
import { RUTA_CALLBACK } from "../authRoutes.js";
import {
  ETIQUETAS_SIMULADAS,
  asociarPerfilSimulado,
  recordarSesion,
  suscribirseALaSesion,
  tieneSesion,
} from "../sesionSimulada.js";
import { SimuladaCallback } from "./SimuladaCallback.jsx";

export function crearSesionSimulada(tipo, ubicacion = window.location) {
  const sesion = {
    simulada: ETIQUETAS_SIMULADAS[tipo],
    CallbackComponent: SimuladaCallback,
    estaAutenticado: () => tieneSesion(),
    async iniciar() {
      recordarSesion(true);
      ubicacion.assign(RUTA_CALLBACK);
    },
    async cerrar() {
      recordarSesion(false);
      ubicacion.assign("/");
    },
    async limpiar() {
      recordarSesion(false);
    },
    obtenerToken: async () => null,
    async asociarPerfil(rol, perfilId) {
      asociarPerfilSimulado(rol, perfilId);
    },
  };
  const acciones = {
    simulada: sesion.simulada,
    cargando: false,
    error: null,
    iniciar: (opciones) => sesion.iniciar(opciones),
    cerrar: () => sesion.cerrar(),
    limpiar: () => sesion.limpiar(),
    obtenerToken: () => sesion.obtenerToken(),
    asociarPerfil: (rol, perfilId) => sesion.asociarPerfil(rol, perfilId),
  };
  sesion.usarSesion = function useSesionSimulada() {
    const autenticado = useSyncExternalStore(suscribirseALaSesion, tieneSesion);
    return { ...acciones, autenticado };
  };
  return sesion;
}
