import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  estaPublicado,
  fueRechazado,
  rechazoDe,
} from "@/Application/Domain/Reglas/publicacion.js";
import { bajaDe, estaDadoDeBaja } from "@/Application/Domain/Reglas/baja.js";
import { avisoDeBaja } from "./baja.js";
import { ESTADO_BUSQUEDA, fechaLarga, selloDeProyecto } from "./proyecto.js";

const SELLO_CON_CAMBIOS_PEDIDOS = Object.freeze({
  tipo: ESTADO_BUSQUEDA.LIMITE,
  texto: "Con cambios pedidos",
});

export const VISIBILIDAD_DEL_BORRADOR = "Lo ven solo tu colectivo y administración.";

const SIN_NOTA =
  "No dejó una nota. Revisá los datos y los perfiles antes de volver a pedir la publicación.";

export function selloDelDueno(proyecto) {
  return fueRechazado(proyecto)
    ? SELLO_CON_CAMBIOS_PEDIDOS
    : selloDeProyecto(proyecto.estado);
}

export function textoDeRechazo(rechazo) {
  const fecha = fechaLarga(rechazo.fecha);
  const nota = rechazo.nota?.trim();
  return nota
    ? `Administración pidió cambios el ${fecha}: ${nota}`
    : `Administración pidió cambios el ${fecha}, sin dejar una nota.`;
}

function notaDelRechazo(rechazo) {
  const fecha = fechaLarga(rechazo.fecha);
  const nota = rechazo.nota?.trim();
  return nota
    ? { etiqueta: `Qué pidió administración el ${fecha}`, nota }
    : { etiqueta: `Administración pidió cambios el ${fecha}`, nota: SIN_NOTA };
}

const DESCRIPCION_DEL_BORRADOR = `${VISIBILIDAD_DEL_BORRADOR} Cuando esté listo, pedí su publicación.`;

export const BLOQUEO_EN_REVISION =
  "Hasta que administración la apruebe o pida cambios, no se puede editar.";

const COMO_SE_ENTERA =
  "No te llega un aviso: el resultado lo ves acá y en Mis proyectos.";

const VISTA_PREVIA =
  "Vista previa: todavía no está publicado. Lo ven solo el colectivo y administración.";

function solicitadaEn(proyecto) {
  return proyecto.publicacion?.solicitadaEn ?? null;
}

function avisoEnRevision(titulo, proyecto) {
  const fecha = solicitadaEn(proyecto);
  const pedido = fecha
    ? `Pediste la publicación el ${fechaLarga(fecha)}.`
    : "Pediste la publicación.";
  return {
    titulo,
    descripcion: `${pedido} ${BLOQUEO_EN_REVISION}`,
    ayuda: COMO_SE_ENTERA,
  };
}

export function textoDeFechaSinPublicar(proyecto) {
  const baja = bajaDe(proyecto);
  if (baja?.fecha) return { texto: "Dado de baja el ", fecha: baja.fecha };
  const fecha = proyecto.estado === PROYECTO_ESTADO.EN_REVISION && solicitadaEn(proyecto);
  return fecha ? { texto: "Publicación pedida el ", fecha } : null;
}

export function avisoDePublicacion(proyecto, { esAdministracion }) {
  if (estaPublicado(proyecto)) return null;
  const titulo = selloDelDueno(proyecto).texto;
  if (estaDadoDeBaja(proyecto)) return avisoDeBaja(proyecto, titulo);
  if (esAdministracion) return { titulo, descripcion: VISTA_PREVIA };
  if (proyecto.estado === PROYECTO_ESTADO.EN_REVISION)
    return avisoEnRevision(titulo, proyecto);
  const rechazo = rechazoDe(proyecto);
  if (!rechazo) return { titulo, descripcion: DESCRIPCION_DEL_BORRADOR };
  return {
    titulo,
    rechazo: notaDelRechazo(rechazo),
    descripcion: "Cuando hagas los cambios, volvé a pedir la publicación.",
  };
}
