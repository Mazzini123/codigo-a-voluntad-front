import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { MODO_ACEPTACION } from "@/Application/Domain/Enums/MODO_ACEPTACION.js";
import { PERIODO_COMPROMISO } from "@/Application/Domain/Enums/PERIODO_COMPROMISO.js";
import { MODALIDAD_COLABORACION } from "@/Application/Domain/Enums/MODALIDAD_COLABORACION.js";
import {
  MOTIVO_DE_CIERRE,
  motivoDeCierre,
  perfilesAbiertos,
} from "@/Application/Domain/Reglas/busquedaDePerfil.js";

const TEXTO_PERIODO = Object.freeze({
  [PERIODO_COMPROMISO.HS_MENSUALES]: "por mes",
  [PERIODO_COMPROMISO.HS_SEMANALES]: "por semana",
  [PERIODO_COMPROMISO.HS_TOTALES]: "en total",
});

export const TEXTO_MODALIDAD = Object.freeze({
  [MODALIDAD_COLABORACION.GRATUITA]: "Colaboración sin remuneración",
  [MODALIDAD_COLABORACION.OFRECE_INCENTIVO_ECONOMICO]: "Con incentivo económico",
  [MODALIDAD_COLABORACION.EXISTE_POSIBILIDAD_DE_CONTRATACION]:
    "Con posibilidad de contratación",
});

const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export const ESTADO_BUSQUEDA = Object.freeze({
  ABIERTA: "abierta",
  LIMITE: "limite",
  CERRADA: "cerrada",
  FINALIZADO: "finalizado",
  RECHAZADA: "rechazada",
});

export function selloDeProyecto(estado) {
  if (estado === PROYECTO_ESTADO.ABIERTO)
    return { tipo: ESTADO_BUSQUEDA.ABIERTA, texto: "Abierto" };
  if (estado === PROYECTO_ESTADO.FINALIZADO)
    return { tipo: ESTADO_BUSQUEDA.FINALIZADO, texto: "Finalizado" };
  return null;
}

export function textoCompromiso(compromiso) {
  if (!compromiso) return "";
  return `${compromiso.cantidadHoras} h ${TEXTO_PERIODO[compromiso.periodo] ?? ""}`.trim();
}

export function textoModalidad(modalidad) {
  return TEXTO_MODALIDAD[modalidad] ?? "";
}

export function fechaCorta(fechaIso) {
  return FORMATO_FECHA_CORTA.format(new Date(fechaIso));
}

const SELLO_POR_MOTIVO = Object.freeze({
  [MOTIVO_DE_CIERRE.PROYECTO_FINALIZADO]: Object.freeze({
    tipo: ESTADO_BUSQUEDA.FINALIZADO,
    texto: "Finalizado",
  }),
  [MOTIVO_DE_CIERRE.BUSQUEDA_CERRADA]: Object.freeze({
    tipo: ESTADO_BUSQUEDA.CERRADA,
    texto: "Cerrada",
  }),
  [MOTIVO_DE_CIERRE.BUSQUEDA_VENCIDA]: Object.freeze({
    tipo: ESTADO_BUSQUEDA.CERRADA,
    texto: "Cerrada",
  }),
  [MOTIVO_DE_CIERRE.LIMITE_ALCANZADO]: Object.freeze({
    tipo: ESTADO_BUSQUEDA.LIMITE,
    texto: "Límite alcanzado",
  }),
});

export function estadoDeBusqueda(perfil, proyecto, hoy = new Date()) {
  const motivo = motivoDeCierre(perfil, proyecto, hoy);
  if (motivo) return SELLO_POR_MOTIVO[motivo];
  return {
    tipo: ESTADO_BUSQUEDA.ABIERTA,
    texto: perfil.fechaCierreBusqueda
      ? `Abierta hasta el ${fechaCorta(perfil.fechaCierreBusqueda)}`
      : "Abierta",
  };
}

const TEXTO_NO_POSTULABLE = Object.freeze({
  [MOTIVO_DE_CIERRE.PROYECTO_FINALIZADO]: () => "Este proyecto ya finalizó.",
  [MOTIVO_DE_CIERRE.BUSQUEDA_CERRADA]: () => "La búsqueda de este perfil está cerrada.",
  [MOTIVO_DE_CIERRE.BUSQUEDA_VENCIDA]: (perfil) =>
    `La búsqueda de este perfil cerró el ${fechaCorta(perfil.fechaCierreBusqueda)}.`,
  [MOTIVO_DE_CIERRE.LIMITE_ALCANZADO]: () =>
    "Este perfil ya completó su límite de colaboraciones.",
});

export function motivoNoPostulable(perfil, proyecto, hoy = new Date()) {
  const motivo = motivoDeCierre(perfil, proyecto, hoy);
  return motivo ? TEXTO_NO_POSTULABLE[motivo](perfil) : null;
}

function momentoDeCierre(perfil) {
  return perfil.fechaCierreBusqueda
    ? new Date(perfil.fechaCierreBusqueda).getTime()
    : Infinity;
}

export function perfilDestacado(proyecto, hoy = new Date()) {
  const abiertos = perfilesAbiertos(proyecto, hoy);
  const candidatos = abiertos.length > 0 ? abiertos : (proyecto.perfiles ?? []);
  return (
    [...candidatos].sort((a, b) => momentoDeCierre(a) - momentoDeCierre(b))[0] ?? null
  );
}

export function habilidadesBuscadas(proyecto, hoy = new Date()) {
  const vistas = new Map();
  for (const perfil of perfilesAbiertos(proyecto, hoy)) {
    for (const habilidad of perfil.habilidadesRequeridas ?? []) {
      if (!vistas.has(habilidad.codigo)) vistas.set(habilidad.codigo, habilidad);
    }
  }
  return [...vistas.values()];
}

function encajeDeHabilidades(perfil, codigosPropios) {
  const total = perfil.habilidadesRequeridas?.length ?? 0;
  if (total === 0) return null;
  const tiene = perfil.habilidadesRequeridas.filter((h) =>
    codigosPropios.has(h.codigo),
  ).length;
  return { tiene, total };
}

export function encajeDelPerfil(perfil, proyecto, codigosPropios, hoy = new Date()) {
  if (estadoDeBusqueda(perfil, proyecto, hoy).tipo !== ESTADO_BUSQUEDA.ABIERTA)
    return null;
  const encaje = encajeDeHabilidades(perfil, codigosPropios);
  return encaje && encaje.tiene > 0 ? encaje : null;
}

export function encajeCon(
  proyecto,
  codigosPropios,
  hoy = new Date(),
  postulados = new Set(),
) {
  let mejor = null;
  for (const perfil of perfilesAbiertos(proyecto, hoy)) {
    if (postulados.has(perfil.id)) continue;
    const encaje = encajeDeHabilidades(perfil, codigosPropios);
    if (encaje && (!mejor || encaje.tiene / encaje.total > mejor.tiene / mejor.total))
      mejor = encaje;
  }
  return mejor && mejor.tiene > 0 ? mejor : null;
}

export function textoEncaje({ tiene, total }) {
  return `Tenés ${tiene} de ${total} ${total === 1 ? "habilidad requerida" : "habilidades requeridas"}`;
}

const TEXTO_MODO_ACEPTACION = Object.freeze({
  [MODO_ACEPTACION.REVISION_MANUAL]: "El colectivo revisa cada postulación",
  [MODO_ACEPTACION.TODO_SUMA]: "Se acepta a todas las personas que se postulan",
  [MODO_ACEPTACION.HASTA_LLENAR_VACANTES]:
    "Se acepta automáticamente hasta completar el límite",
});

const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function textoLimite(limite) {
  if (limite == null) return "Sin límite";
  return `Hasta ${limite} ${limite === 1 ? "colaboración" : "colaboraciones"}`;
}

export function textoPrivacidadDePostulacion(perfil) {
  return perfil?.modoAceptacion === MODO_ACEPTACION.REVISION_MANUAL
    ? "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación."
    : "Este perfil acepta automáticamente: al enviar, el colectivo va a ver tus datos de contacto.";
}

export function textoModoAceptacion(modo) {
  return TEXTO_MODO_ACEPTACION[modo] ?? "";
}

export function fechaLarga(fechaIso) {
  return FORMATO_FECHA_LARGA.format(new Date(fechaIso));
}

export function textoPerfilesQueBuscan(cantidad) {
  if (cantidad === 0) return "Ningún perfil busca gente";
  return cantidad === 1 ? "1 perfil busca gente" : `${cantidad} perfiles buscan gente`;
}

export function textoPostulacionesPendientes(cantidad) {
  return cantidad === 1
    ? "1 postulación pendiente"
    : `${cantidad} postulaciones pendientes`;
}

export function textoPostulacionesPorRevisar(cantidad) {
  return cantidad === 1
    ? "Tenés 1 postulación por revisar."
    : `Tenés ${cantidad} postulaciones por revisar.`;
}
