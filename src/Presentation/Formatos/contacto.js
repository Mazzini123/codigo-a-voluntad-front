import { TIPOS_MEDIOS_CONTACTO } from "@/Application/Domain/Enums/TIPOS_MEDIOS_CONTACTO.js";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { TEXTO_MEDIO_DE_CONTACTO } from "@/Presentation/Formatos/colectivo.js";

export const TITULO_DE_CONTACTO = "Datos de contacto";
export const AVISO_DE_PRIVACIDAD =
  "Estos datos son privados. Compartilos solo para coordinar el trabajo en este proyecto.";
export const MENSAJE_SIN_ACCESO =
  "Estos datos se comparten solo cuando aceptás su postulación";
export const MENSAJE_NO_ENCONTRADA = "No encontramos a esta persona en el proyecto";
export const TITULO_SIN_MEDIOS =
  "Esta persona no cargó medios de contacto; podés escribirle por mensajería interna";
export const MENSAJE_CONTRIBUCION_ANONIMA =
  "Contribución anónima: no se comparten datos de contacto";
export const MENSAJE_NO_SE_PUDO_COPIAR =
  "No pudimos copiar. Seleccioná el texto y copialo a mano.";

const NOMBRE_PARA_COPIAR = Object.freeze({
  [TIPOS_MEDIOS_CONTACTO.EMAIL]: "email",
  [TIPOS_MEDIOS_CONTACTO.WHATSAPP]: "WhatsApp",
  [TIPOS_MEDIOS_CONTACTO.SMS]: "SMS",
});

export function etiquetaDeMedio(tipo) {
  return TEXTO_MEDIO_DE_CONTACTO[tipo] ?? tipo;
}

export function nombreParaCopiar(tipo) {
  return NOMBRE_PARA_COPIAR[tipo] ?? tipo;
}

export function textoDeCopiar(tipo) {
  return `Copiar ${nombreParaCopiar(tipo)}`;
}

export function avisoDeCopiado(tipo) {
  return `Copiaste el ${nombreParaCopiar(tipo)}`;
}

export function tituloDeContacto(nombre) {
  return nombre ? `${TITULO_DE_CONTACTO} de ${nombre}` : TITULO_DE_CONTACTO;
}

export function puedeVerContacto(fila) {
  return (
    fila?.estado === COLABORACION_ESTADO.ACEPTADA &&
    fila.esPublica !== false &&
    Boolean(fila.colaborador?.id)
  );
}

export function esContribucionAnonimaAceptada(fila) {
  return fila?.estado === COLABORACION_ESTADO.ACEPTADA && fila.esPublica === false;
}
