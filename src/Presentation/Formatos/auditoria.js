import { ACCION_ADMINISTRATIVA } from "@/Application/Domain/Enums/ACCION_ADMINISTRATIVA.js";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { TIPO_ENTIDAD_AUDITADA } from "@/Application/Domain/Enums/TIPO_ENTIDAD_AUDITADA.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";

const ACCIONES = Object.freeze({
  [ACCION_ADMINISTRATIVA.PROYECTO_DESTACADO]: "Destacó un proyecto",
  [ACCION_ADMINISTRATIVA.PROYECTO_DESTACADO_QUITADO]: "Quitó un destacado",
  [ACCION_ADMINISTRATIVA.REVISION_RESUELTA]: "Resolvió una revisión",
  [ACCION_ADMINISTRATIVA.ADMIN_OTORGADO]: "Otorgó el rol de administración",
});

const ENTIDADES = Object.freeze({
  [TIPO_ENTIDAD_AUDITADA.PROYECTO]: "Proyecto",
  [TIPO_ENTIDAD_AUDITADA.REVISION]: "Revisión",
  [TIPO_ENTIDAD_AUDITADA.USUARIO]: "Usuaria",
});

function aOpciones(textos) {
  return Object.freeze(
    Object.entries(textos).map(([valor, texto]) => Object.freeze({ valor, texto })),
  );
}

export const OPCIONES_DE_ACCION = aOpciones(ACCIONES);
export const OPCIONES_DE_ENTIDAD = aOpciones(ENTIDADES);

export function textoDeAccion(accion) {
  return ACCIONES[accion] ?? "Acción administrativa";
}

export function textoDeEntidad(tipo) {
  return ENTIDADES[tipo] ?? "Otro elemento";
}

export function textoDeQuien(usuarioId) {
  return usuarioId ? "Administración" : "Comando del sistema";
}

function fechaValida(texto) {
  return typeof texto === "string" && !Number.isNaN(new Date(texto).getTime());
}

export function textoDeDetalle(accion, detalle) {
  if (accion === ACCION_ADMINISTRATIVA.PROYECTO_DESTACADO) {
    if (!fechaValida(detalle?.hasta)) return null;
    const fecha = fechaLarga(detalle.hasta);
    return detalle.cambio
      ? `Cambió la fecha: hasta el ${fecha}`
      : `Destacado hasta el ${fecha}`;
  }
  if (accion === ACCION_ADMINISTRATIVA.REVISION_RESUELTA) {
    if (detalle?.estado === ESTADO_REVISION.REVISADA) return "Marcada como revisada";
    if (detalle?.estado === ESTADO_REVISION.DESCARTADA) return "Descartada";
  }
  return null;
}

export function errorDeRangoDeFechas(desde, hasta) {
  return desde && hasta && hasta < desde
    ? "La fecha «hasta» no puede ser anterior a «desde»."
    : null;
}

export function desdeDelDia(fecha) {
  return `${fecha}T00:00:00-03:00`;
}

const FORMATO_FECHA_Y_HORA = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function fechaYHora(fechaIso) {
  return FORMATO_FECHA_Y_HORA.format(new Date(fechaIso));
}
