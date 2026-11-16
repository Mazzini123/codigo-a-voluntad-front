import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

const SIN_PUBLICAR = Object.freeze([
  PROYECTO_ESTADO.BORRADOR,
  PROYECTO_ESTADO.EN_REVISION,
  PROYECTO_ESTADO.DADO_DE_BAJA,
]);
const EDITABLES = Object.freeze([PROYECTO_ESTADO.BORRADOR, PROYECTO_ESTADO.ABIERTO]);

export function estaPublicado(proyecto) {
  return !SIN_PUBLICAR.includes(proyecto?.estado);
}

export function esEditable(proyecto) {
  return EDITABLES.includes(proyecto?.estado);
}

export function puedePedirPublicacion(proyecto) {
  return proyecto?.estado === PROYECTO_ESTADO.BORRADOR;
}

export function rechazoDe(proyecto) {
  if (!puedePedirPublicacion(proyecto)) return null;
  return proyecto.publicacion?.rechazo ?? null;
}

export function fueRechazado(proyecto) {
  return rechazoDe(proyecto) !== null;
}
