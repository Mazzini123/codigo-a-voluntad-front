import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";
import { ROL_EN_CONTEXTO } from "@/Application/Domain/Enums/ROL_EN_CONTEXTO.js";

const MENSAJES_POR_CODIGO = Object.freeze({
  [CODIGO_ERROR.LIDER_DEBE_TRANSFERIR]:
    "Antes de irte, pasale el liderazgo a otra persona del colectivo.",
  [CODIGO_ERROR.LIDER_UNICO_MIEMBRO]:
    "Sos la única persona del colectivo. Para irte, tenés que dar de baja el colectivo.",
  [CODIGO_ERROR.YA_NO_ES_LIDER]: "Ya no tenés el liderazgo del colectivo.",
  [CODIGO_ERROR.DESTINO_INVALIDO]: "Esa persona ya no forma parte del colectivo.",
  [CODIGO_ERROR.SOLICITUD_YA_RESUELTA]: "Esa solicitud ya había sido resuelta.",
  [CODIGO_ERROR.SOLICITUD_PENDIENTE]:
    "Ya tenés una solicitud pendiente para este colectivo.",
  [CODIGO_ERROR.YA_ES_MIEMBRO]: "Ya formás parte de este colectivo.",
  [CODIGO_ERROR.COLECTIVO_DADO_DE_BAJA]: "El colectivo fue dado de baja.",
  [CODIGO_ERROR.MODALIDAD_INCOMPATIBLE]:
    "Tu cuenta participa como colaboradora. Para sumarte a un colectivo, primero das de baja ese perfil.",
});

export function mensajeDeMembresia(error, porDefecto) {
  return MENSAJES_POR_CODIGO[error?.codigo] ?? porDefecto;
}

const ROLES = Object.freeze({
  [ROL_EN_CONTEXTO.LIDER]: "Liderazgo",
  [ROL_EN_CONTEXTO.MIEMBRO]: "Miembro",
});

export function nombreDelRol(rol) {
  return ROLES[rol] ?? "Miembro";
}

export function nombreDePersona(nombre) {
  return nombre?.trim() || "Persona sin nombre";
}

export const ESTADOS_DE_SOLICITUD = Object.freeze([
  Object.freeze({
    valor: ESTADO_SOLICITUD.PENDIENTE,
    texto: "Pendientes",
    singular: "Pendiente",
  }),
  Object.freeze({
    valor: ESTADO_SOLICITUD.ACEPTADA,
    texto: "Aceptadas",
    singular: "Aceptada",
  }),
  Object.freeze({
    valor: ESTADO_SOLICITUD.RECHAZADA,
    texto: "Rechazadas",
    singular: "Rechazada",
  }),
  Object.freeze({
    valor: ESTADO_SOLICITUD.CANCELADA,
    texto: "Canceladas",
    singular: "Cancelada",
  }),
]);

export function nombreDelEstadoDeSolicitud(estado) {
  return (
    ESTADOS_DE_SOLICITUD.find(({ valor }) => valor === estado)?.singular ?? "Sin estado"
  );
}
