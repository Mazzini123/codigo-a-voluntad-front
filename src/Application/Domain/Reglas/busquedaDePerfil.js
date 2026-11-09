import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

export const MOTIVO_DE_CIERRE = Object.freeze({
  PROYECTO_FINALIZADO: "PROYECTO_FINALIZADO",
  BUSQUEDA_CERRADA: "BUSQUEDA_CERRADA",
  BUSQUEDA_VENCIDA: "BUSQUEDA_VENCIDA",
  LIMITE_ALCANZADO: "LIMITE_ALCANZADO",
});

const ESTADO_BUSQUEDA_DEL_BACK = Object.freeze({
  CERRADA: "CERRADA",
  LIMITE_ALCANZADO: "LIMITE_ALCANZADO",
});

export function busquedaVencida(perfil, hoy = new Date()) {
  return (
    Boolean(perfil.fechaCierreBusqueda) && new Date(perfil.fechaCierreBusqueda) <= hoy
  );
}

export function colaboracionesAceptadasDe(proyecto, perfil) {
  return (proyecto.colaboraciones ?? []).filter(
    (colaboracion) =>
      colaboracion.perfil === perfil.id &&
      colaboracion.estado === COLABORACION_ESTADO.ACEPTADA,
  );
}

export function limiteAlcanzado(perfil, proyecto) {
  if (perfil.estadoBusqueda === ESTADO_BUSQUEDA_DEL_BACK.LIMITE_ALCANZADO) return true;
  return (
    perfil.limiteColaboraciones != null &&
    colaboracionesAceptadasDe(proyecto, perfil).length >= perfil.limiteColaboraciones
  );
}

export function motivoDeCierre(perfil, proyecto, hoy = new Date()) {
  if (proyecto.estado === PROYECTO_ESTADO.FINALIZADO)
    return MOTIVO_DE_CIERRE.PROYECTO_FINALIZADO;
  if (!perfil.busquedaAbierta) return MOTIVO_DE_CIERRE.BUSQUEDA_CERRADA;
  if (busquedaVencida(perfil, hoy)) return MOTIVO_DE_CIERRE.BUSQUEDA_VENCIDA;
  if (limiteAlcanzado(perfil, proyecto)) return MOTIVO_DE_CIERRE.LIMITE_ALCANZADO;
  if (perfil.estadoBusqueda === ESTADO_BUSQUEDA_DEL_BACK.CERRADA)
    return MOTIVO_DE_CIERRE.BUSQUEDA_CERRADA;
  return null;
}

export function recibePostulaciones(perfil, proyecto, hoy = new Date()) {
  return motivoDeCierre(perfil, proyecto, hoy) === null;
}

export function perfilesAbiertos(proyecto, hoy = new Date()) {
  return (proyecto.perfiles ?? []).filter((perfil) =>
    recibePostulaciones(perfil, proyecto, hoy),
  );
}

export function esPostulacionActiva(estado) {
  return (
    estado === COLABORACION_ESTADO.PENDIENTE || estado === COLABORACION_ESTADO.ACEPTADA
  );
}

export function postulacionesPendientes(proyecto) {
  if (!Array.isArray(proyecto.colaboraciones)) return null;
  return proyecto.colaboraciones.filter(
    (colaboracion) => colaboracion.estado === COLABORACION_ESTADO.PENDIENTE,
  ).length;
}
