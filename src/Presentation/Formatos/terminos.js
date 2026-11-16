import { fechaLarga } from "./proyecto.js";

export const LARGO_MAXIMO_DE_TERMINOS = 50000;

export function textoDeVersion({ version, publicadoEn }) {
  return publicadoEn
    ? `Versión ${version}, publicada el ${fechaLarga(publicadoEn)}`
    : `Versión ${version}`;
}

export function textoDeAceptacion({ version }) {
  return `Acepto los términos y condiciones (versión ${version})`;
}

export function versionSiguiente(terminos) {
  return (terminos?.version ?? 0) + 1;
}

export function errorDeTextoDeTerminos(texto) {
  if (!texto.trim()) return "Escribí el texto de los términos.";
  if (texto.length > LARGO_MAXIMO_DE_TERMINOS)
    return `El texto puede tener hasta ${LARGO_MAXIMO_DE_TERMINOS.toLocaleString("es-AR")} caracteres.`;
  return null;
}

export function errorDeTerminosSinCambios(texto, terminos) {
  return terminos && texto.trim() === terminos.texto.trim()
    ? "El texto es igual a la versión vigente. Cambialo antes de publicar."
    : null;
}

const MENSAJES_AL_PUBLICAR = Object.freeze({
  409: "Se publicó otra versión al mismo tiempo. Actualizamos el texto vigente: revisalo antes de publicar.",
  403: "Tu cuenta no puede publicar los términos.",
  400: "Revisá el texto: no pudimos publicarlo así.",
});

export function mensajeDePublicarTerminos(error) {
  return (
    MENSAJES_AL_PUBLICAR[error?.status] ??
    "No pudimos publicar los términos. Probá de nuevo."
  );
}

export const TERMINOS_CAMBIARON =
  "Los términos y condiciones cambiaron mientras completabas el proyecto. Leé la versión nueva y aceptala para seguir.";

export const ACEPTACION_REQUERIDA = "Aceptá los términos y condiciones para seguir.";
