import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { MOTIVO_REVISION } from "@/Application/Domain/Enums/MOTIVO_REVISION.js";

const MOTIVOS = Object.freeze({
  [MOTIVO_REVISION.PUBLICACION]: "Pidió publicar el proyecto",
  [MOTIVO_REVISION.SIN_ACTUALIZACIONES]: "Sin actualizaciones hace más de 30 días",
});

const ESTADOS = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "Pendiente",
  [ESTADO_REVISION.REVISADA]: "Revisada",
  [ESTADO_REVISION.DESCARTADA]: "Descartada",
});

const ESTADOS_DE_PUBLICACION = Object.freeze({
  ...ESTADOS,
  [ESTADO_REVISION.REVISADA]: "Aprobada",
  [ESTADO_REVISION.DESCARTADA]: "Con cambios pedidos",
});

export const ESTADOS_DE_REVISION = Object.freeze([
  Object.freeze({ valor: ESTADO_REVISION.PENDIENTE, texto: "Pendientes" }),
  Object.freeze({ valor: ESTADO_REVISION.REVISADA, texto: "Revisadas" }),
  Object.freeze({ valor: ESTADO_REVISION.DESCARTADA, texto: "Descartadas" }),
]);

export const MOTIVOS_DE_REVISION = Object.freeze([
  Object.freeze({ valor: "", texto: "Todos" }),
  ...Object.entries(MOTIVOS).map(([valor, texto]) => Object.freeze({ valor, texto })),
]);

export const LARGO_MAXIMO_DE_NOTA = 1000;

export function esDePublicacion(motivo) {
  return motivo === MOTIVO_REVISION.PUBLICACION;
}

export function textoDeMotivo(motivo) {
  return MOTIVOS[motivo] ?? "Requiere revisión";
}

export function textoDeEstadoDeRevision(estado, motivo) {
  const textos = esDePublicacion(motivo) ? ESTADOS_DE_PUBLICACION : ESTADOS;
  return textos[estado] ?? "Sin estado";
}

const MENSAJES = Object.freeze({
  403: "No tenés permiso para hacer esto.",
  404: "No encontramos esa revisión. Actualizamos la lista.",
  409: "Esta revisión ya fue resuelta.",
});

const MENSAJES_DE_PUBLICACION = Object.freeze({
  ...MENSAJES,
  409: "Esta publicación ya fue resuelta.",
  422: "La fecha de cierre del proyecto ya pasó. Pedí cambios con una nota para que el colectivo la corrija.",
});

const CONFLICTO_DE_INTERESES = Object.freeze({
  publicacion: "No podés resolver la publicación de un proyecto de tu propio colectivo.",
  otra: "No podés resolver una revisión de un proyecto de tu propio colectivo.",
});

export function mensajeDeRevision(error, motivo) {
  const publicacion = esDePublicacion(motivo);
  if (error?.codigo === CODIGO_ERROR.CONFLICTO_DE_INTERESES) {
    return publicacion ? CONFLICTO_DE_INTERESES.publicacion : CONFLICTO_DE_INTERESES.otra;
  }
  const mensajes = publicacion ? MENSAJES_DE_PUBLICACION : MENSAJES;
  return mensajes[error?.status] ?? "No pudimos guardar la revisión. Probá de nuevo.";
}
