import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { bajaDe, ESTADOS_PARA_BAJA } from "@/Application/Domain/Reglas/baja.js";
import { fechaLarga, selloDeProyecto } from "./proyecto.js";

export const LARGO_MAXIMO_DE_MOTIVO = 1000;

export const TIPO_DE_BAJA = Object.freeze({
  PROYECTO: "proyecto",
  COLECTIVO: "colectivo",
});

const ESTADOS_EN_PLURAL = Object.freeze({
  [PROYECTO_ESTADO.BORRADOR]: "en borrador",
  [PROYECTO_ESTADO.EN_REVISION]: "en revisión",
  [PROYECTO_ESTADO.ABIERTO]: "abiertos",
  [PROYECTO_ESTADO.FINALIZADO]: "finalizados",
});

export const OPCIONES_DE_ESTADO_PARA_BAJA = Object.freeze([
  Object.freeze({ valor: "", texto: "Todos" }),
  ...ESTADOS_PARA_BAJA.map((estado) =>
    Object.freeze({ valor: estado, texto: selloDeProyecto(estado).texto }),
  ),
]);

export function sinProyectosEnEstado(estado) {
  return `No hay proyectos ${ESTADOS_EN_PLURAL[estado]}`;
}

export const MOTIVO_CONFLICTO_DE_BAJA =
  "No podés dar de baja un proyecto de un colectivo del que formás parte.";

const SIN_MOTIVO =
  "Administración lo dio de baja por no cumplir los términos y condiciones.";

const CONSECUENCIA_PARA_EL_COLECTIVO =
  "Ya no se puede editar ni publicar, y nadie más que tu colectivo y administración lo ve.";

export function errorDeMotivoDeBaja(motivo) {
  if (!motivo.trim()) return "Contá el motivo de la baja.";
  if (motivo.length > LARGO_MAXIMO_DE_MOTIVO)
    return `El motivo puede tener hasta ${LARGO_MAXIMO_DE_MOTIVO} caracteres.`;
  return null;
}

export function textoDeBajaDelProyecto(baja) {
  if (!baja?.motivo) return SIN_MOTIVO;
  return `Administración lo dio de baja el ${fechaLarga(baja.fecha)}: ${baja.motivo}`;
}

export function avisoDeBaja(proyecto, titulo) {
  const baja = bajaDe(proyecto);
  const descripcion = `${SIN_MOTIVO} ${CONSECUENCIA_PARA_EL_COLECTIVO}`;
  if (!baja?.motivo) return { titulo, descripcion };
  return {
    titulo,
    rechazo: {
      etiqueta: `Motivo de la baja, ${fechaLarga(baja.fecha)}`,
      nota: baja.motivo,
    },
    descripcion,
  };
}

const MENSAJES = Object.freeze({
  [TIPO_DE_BAJA.PROYECTO]: Object.freeze({
    409: "Este proyecto ya estaba dado de baja. Actualizamos la lista.",
    404: "No encontramos este proyecto. Actualizamos la lista.",
    403: "Tu cuenta no puede dar de baja proyectos.",
    conflicto: MOTIVO_CONFLICTO_DE_BAJA,
    otro: "No pudimos dar de baja el proyecto. Probá de nuevo.",
  }),
  [TIPO_DE_BAJA.COLECTIVO]: Object.freeze({
    409: "Este colectivo ya estaba dado de baja. Actualizamos la lista.",
    404: "No encontramos este colectivo. Actualizamos la lista.",
    403: "Tu cuenta no puede dar de baja colectivos.",
    conflicto: "No podés dar de baja un colectivo del que formás parte.",
    otro: "No pudimos dar de baja el colectivo. Probá de nuevo.",
  }),
});

export function mensajeDeBaja(error, tipo) {
  const mensajes = MENSAJES[tipo];
  if (error?.codigo === CODIGO_ERROR.CONFLICTO_DE_INTERESES) return mensajes.conflicto;
  return mensajes[error?.status] ?? mensajes.otro;
}
