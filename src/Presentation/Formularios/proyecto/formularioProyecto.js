import { MODALIDAD_COLABORACION } from "@/Application/Domain/Enums/MODALIDAD_COLABORACION.js";
import { MODO_ACEPTACION } from "@/Application/Domain/Enums/MODO_ACEPTACION.js";
import { PERIODO_COMPROMISO } from "@/Application/Domain/Enums/PERIODO_COMPROMISO.js";
import { crearClave, idDeCampo } from "@/Presentation/Formularios/comunes/formulario.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

export const PASOS_DEL_ALTA = Object.freeze([
  "El proyecto",
  "Los perfiles",
  "Revisar y publicar",
]);

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
const DESFASE_ARGENTINA = "-03:00";

const FORMATO_DIA = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function hoyEnArgentina(ahora = new Date()) {
  return FORMATO_DIA.format(ahora);
}

export function esFechaFutura(fecha, ahora = new Date()) {
  return fecha > hoyEnArgentina(ahora);
}

export function finDelDia(fecha) {
  return `${fecha}T23:59:59${DESFASE_ARGENTINA}`;
}

export function proyectoVacio() {
  return { titulo: "", descripcion: "", etiquetas: [], fechaCierre: "" };
}

export function proyectoEstaVacio(proyecto) {
  return (
    !proyecto.titulo.trim() &&
    !proyecto.descripcion.trim() &&
    proyecto.etiquetas.length === 0 &&
    !proyecto.fechaCierre
  );
}

export function perfilVacio() {
  return {
    clave: crearClave(),
    descripcion: "",
    requeridas: [],
    opcionales: [],
    horas: "",
    periodo: PERIODO_COMPROMISO.HS_SEMANALES,
    modalidad: MODALIDAD_COLABORACION.GRATUITA,
    modoAceptacion: MODO_ACEPTACION.REVISION_MANUAL,
    limite: "",
    fechaCierreBusqueda: "",
  };
}

export function perfilEstaVacio(perfil) {
  const vacio = perfilVacio();
  return (
    !perfil.descripcion.trim() &&
    perfil.requeridas.length === 0 &&
    perfil.opcionales.length === 0 &&
    !perfil.horas.trim() &&
    perfil.periodo === vacio.periodo &&
    perfil.modalidad === vacio.modalidad &&
    perfil.modoAceptacion === vacio.modoAceptacion &&
    !perfil.limite.trim() &&
    !perfil.fechaCierreBusqueda
  );
}

function limiteDelPerfil(perfil) {
  if (perfil.modoAceptacion === MODO_ACEPTACION.TODO_SUMA) return null;
  const limite = perfil.limite.trim();
  return limite ? Number(limite) : null;
}

export function perfilARequest(perfil) {
  return {
    descripcion: perfil.descripcion.trim(),
    codigosHabilidadesRequeridas: perfil.requeridas.map((habilidad) => habilidad.codigo),
    codigosHabilidadesOpcionales: perfil.opcionales.map((habilidad) => habilidad.codigo),
    compromiso: { cantidadHoras: Number(perfil.horas), periodo: perfil.periodo },
    modalidadColaboracion: perfil.modalidad,
    modoAceptacion: perfil.modoAceptacion,
    limiteColaboraciones: limiteDelPerfil(perfil),
    ...(perfil.fechaCierreBusqueda && {
      fechaCierreBusqueda: finDelDia(perfil.fechaCierreBusqueda),
    }),
  };
}

export function proyectoARequest(proyecto, perfiles) {
  return {
    titulo: proyecto.titulo.trim(),
    descripcion: proyecto.descripcion.trim(),
    etiquetas: proyecto.etiquetas,
    perfiles: perfiles.map(perfilARequest),
    ...(proyecto.fechaCierre && { fechaCierre: finDelDia(proyecto.fechaCierre) }),
  };
}

export function perfilParaVista(perfil) {
  return {
    id: perfil.clave,
    descripcion: perfil.descripcion.trim(),
    compromiso: { cantidadHoras: Number(perfil.horas), periodo: perfil.periodo },
    modalidadColaboracion: perfil.modalidad,
    habilidadesRequeridas: perfil.requeridas,
    habilidadesOpcionales: perfil.opcionales,
    busquedaAbierta: true,
    fechaCierreBusqueda: perfil.fechaCierreBusqueda
      ? finDelDia(perfil.fechaCierreBusqueda)
      : null,
    limiteColaboraciones: limiteDelPerfil(perfil),
    modoAceptacion: perfil.modoAceptacion,
  };
}

export function proyectoParaVista(proyecto, perfiles) {
  return {
    id: "vista-previa",
    titulo: proyecto.titulo.trim(),
    descripcion: proyecto.descripcion.trim(),
    estado: PROYECTO_ESTADO.ABIERTO,
    etiquetas: proyecto.etiquetas,
    perfiles: perfiles.map(perfilParaVista),
    colaboraciones: [],
  };
}

const ETIQUETAS_DEL_RESUMEN = [
  ["titulo", "Título"],
  ["descripcion", "Descripción"],
  ["fechaCierre", "Fecha de cierre"],
  ["perfil.descripcion", "Qué necesitan"],
  ["perfil.requeridas", "Habilidades requeridas"],
  ["perfil.opcionales", "Habilidades opcionales"],
  ["perfil.horas", "Cuántas horas"],
  ["perfil.limite", "Cuántas personas"],
  ["perfil.fechaCierreBusqueda", "Fecha de cierre de la búsqueda"],
];

export function itemsDelResumenDelAlta(errores, prefijo) {
  return ETIQUETAS_DEL_RESUMEN.filter(([clave]) => errores[clave]).map(
    ([clave, etiqueta]) => ({ id: idDeCampo(prefijo, clave), etiqueta }),
  );
}

const DATOS_DEL_PROYECTO = Object.freeze({
  titulo: "El título del proyecto",
  descripcion: "La descripción del proyecto",
  etiquetas: "Las etiquetas",
  fechaCierre: "La fecha de cierre del proyecto",
  perfiles: "Los perfiles",
});

const DATOS_DEL_PERFIL = Object.freeze({
  descripcion: "lo que necesitan",
  codigosHabilidadesRequeridas: "las habilidades requeridas",
  codigosHabilidadesOpcionales: "las habilidades opcionales",
  compromiso: "las horas de compromiso",
  modalidadColaboracion: "la modalidad",
  fechaCierreBusqueda: "la fecha de cierre de la búsqueda",
  limiteColaboraciones: "cómo sumar colaboradoras",
  modoAceptacion: "cómo sumar colaboradoras",
});

function datoDeIssue(path) {
  if (!Array.isArray(path) || path.length === 0) return null;
  const [raiz, indice, campo] = path;
  if (raiz === "perfiles" && Number.isInteger(indice)) {
    const dato = DATOS_DEL_PERFIL[campo];
    return dato ? `Perfil ${indice + 1}: ${dato}` : `Perfil ${indice + 1}`;
  }
  return DATOS_DEL_PROYECTO[raiz] ?? null;
}

export function datosARevisar(issues) {
  const datos = [];
  for (const issue of issues ?? []) {
    const dato = datoDeIssue(issue.path);
    if (dato && !datos.includes(dato)) datos.push(dato);
  }
  return datos;
}
