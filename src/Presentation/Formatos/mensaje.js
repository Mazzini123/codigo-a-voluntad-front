import { TIPO_NOTIFICACION } from "@/Application/Domain/Enums/TIPO_NOTIFICACION.js";

const LARGO_DEL_EXTRACTO = 120;

export const TITULO_SIN_MENSAJES = "No tenés mensajes";
export const TEXTO_SIN_LEER = "Sin leer";
export const AVISO_MENSAJE_LEIDO = "Mensaje marcado como leído.";
export const ERROR_AL_MARCAR_COMO_LEIDO = "No pudimos marcarlo como leído.";

const TITULO_POR_TIPO = Object.freeze({
  [TIPO_NOTIFICACION.INVITACION]: "Te invitaron a un proyecto",
  [TIPO_NOTIFICACION.PROYECTOS_COMPATIBLES]: "Hay proyectos que encajan con vos",
  [TIPO_NOTIFICACION.POSTULACION_ACEPTADA]: "Aceptaron tu postulación",
  [TIPO_NOTIFICACION.POSTULACION_RECHAZADA]: "Rechazaron tu postulación",
  [TIPO_NOTIFICACION.COLABORACION_FINALIZADA]: "Terminó una colaboración",
  [TIPO_NOTIFICACION.DESVINCULACION]: "Te desvincularon de un proyecto",
});

const TEXTO_POR_TIPO = Object.freeze({
  [TIPO_NOTIFICACION.INVITACION]:
    "Un colectivo te invita a sumarte a uno de sus proyectos.",
  [TIPO_NOTIFICACION.PROYECTOS_COMPATIBLES]:
    "Encontramos proyectos con perfiles que coinciden con tus habilidades.",
  [TIPO_NOTIFICACION.POSTULACION_ACEPTADA]:
    "El colectivo aceptó tu postulación y ya sos parte del proyecto.",
  [TIPO_NOTIFICACION.POSTULACION_RECHAZADA]: "El colectivo rechazó tu postulación.",
  [TIPO_NOTIFICACION.COLABORACION_FINALIZADA]: "Tu colaboración en el proyecto terminó.",
  [TIPO_NOTIFICACION.DESVINCULACION]: "El colectivo te desvinculó del proyecto.",
});

function textoLimpio(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function tituloDelMensaje(mensaje) {
  return (
    textoLimpio(mensaje?.asunto) ||
    textoLimpio(mensaje?.titulo) ||
    TITULO_POR_TIPO[mensaje?.tipo] ||
    "Mensaje"
  );
}

export function textoDelMensaje(mensaje) {
  return (
    textoLimpio(mensaje?.contenido) ||
    textoLimpio(mensaje?.texto) ||
    TEXTO_POR_TIPO[mensaje?.tipo] ||
    ""
  );
}

export function extractoDelMensaje(mensaje) {
  const primeraLinea = textoDelMensaje(mensaje).split("\n")[0].trim();
  return primeraLinea.length > LARGO_DEL_EXTRACTO
    ? `${primeraLinea.slice(0, LARGO_DEL_EXTRACTO).trimEnd()}…`
    : primeraLinea;
}

export function estaLeido(mensaje) {
  return mensaje?.esLeida === true || mensaje?.leida === true;
}

export function idsDeProyectosDelMensaje(mensaje) {
  const referencias = mensaje?.referencias ?? {};
  const ids = [referencias.proyectoId, ...(referencias.proyectoIds ?? [])].filter(
    (id) => typeof id === "string" && id !== "",
  );
  return [...new Set(ids)];
}

export function textoDelEnlaceAlProyecto(posicion, total) {
  return total === 1 ? "Ver el proyecto" : `Ver el proyecto ${posicion}`;
}
