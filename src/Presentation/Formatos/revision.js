import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { MOTIVO_REVISION } from "@/Application/Domain/Enums/MOTIVO_REVISION.js";

const MOTIVOS = Object.freeze({
  [MOTIVO_REVISION.SIN_ACTUALIZACIONES]: "Sin actualizaciones hace más de 30 días",
});

const ESTADOS = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "Pendiente",
  [ESTADO_REVISION.REVISADA]: "Revisada",
  [ESTADO_REVISION.DESCARTADA]: "Descartada",
});

export const ESTADOS_DE_REVISION = Object.freeze([
  Object.freeze({ valor: ESTADO_REVISION.PENDIENTE, texto: "Pendientes" }),
  Object.freeze({ valor: ESTADO_REVISION.REVISADA, texto: "Revisadas" }),
  Object.freeze({ valor: ESTADO_REVISION.DESCARTADA, texto: "Descartadas" }),
]);

export const LARGO_MAXIMO_DE_NOTA = 1000;

export function textoDeMotivo(motivo) {
  return MOTIVOS[motivo] ?? "Requiere revisión";
}

export function textoDeEstadoDeRevision(estado) {
  return ESTADOS[estado] ?? "Sin estado";
}

const MENSAJES = Object.freeze({
  403: "No tenés permiso para hacer esto.",
  404: "No encontramos esa revisión. Actualizamos la lista.",
  409: "Esta revisión ya fue resuelta.",
});

export function mensajeDeRevision(error) {
  return MENSAJES[error?.status] ?? "No pudimos guardar la revisión. Probá de nuevo.";
}
