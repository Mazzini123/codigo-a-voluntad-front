import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

export function estaDadoDeBaja(proyecto) {
  return proyecto?.estado === PROYECTO_ESTADO.DADO_DE_BAJA;
}

export function bajaDe(proyecto) {
  if (!estaDadoDeBaja(proyecto)) return null;
  return proyecto.baja ?? null;
}

export const ESTADOS_PARA_BAJA = Object.freeze([
  PROYECTO_ESTADO.BORRADOR,
  PROYECTO_ESTADO.EN_REVISION,
  PROYECTO_ESTADO.ABIERTO,
  PROYECTO_ESTADO.FINALIZADO,
]);

export function puedeDarDeBaja(elemento) {
  return elemento?.conflictoDeIntereses !== true;
}
