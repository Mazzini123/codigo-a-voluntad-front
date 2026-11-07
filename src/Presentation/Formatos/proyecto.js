const TEXTO_PERIODO = Object.freeze({
  HS_MENSUALES: "por mes",
  HS_SEMANALES: "por semana",
  HS_TOTALES: "en total",
});

const TEXTO_MODALIDAD = Object.freeze({
  GRATUITA: "Colaboración sin remuneración",
  OFRECE_INCENTIVO_ECONOMICO: "Con incentivo económico",
  EXISTE_POSIBILIDAD_DE_CONTRATACION: "Con posibilidad de contratación",
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
  if (estado === "ABIERTO") return { tipo: ESTADO_BUSQUEDA.ABIERTA, texto: "Abierto" };
  if (estado === "FINALIZADO")
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

export function estadoDeBusqueda(perfil, proyecto, hoy = new Date()) {
  if (proyecto.estado === "FINALIZADO")
    return { tipo: ESTADO_BUSQUEDA.FINALIZADO, texto: "Finalizado" };
  const vencida =
    perfil.fechaCierreBusqueda && new Date(perfil.fechaCierreBusqueda) < hoy;
  if (!perfil.busquedaAbierta || vencida)
    return { tipo: ESTADO_BUSQUEDA.CERRADA, texto: "Cerrada" };
  if (
    perfil.limiteColaboraciones != null &&
    colaboracionesAceptadasDe(proyecto, perfil).length >= perfil.limiteColaboraciones
  )
    return { tipo: ESTADO_BUSQUEDA.LIMITE, texto: "Límite alcanzado" };
  return {
    tipo: ESTADO_BUSQUEDA.ABIERTA,
    texto: perfil.fechaCierreBusqueda
      ? `Abierta hasta el ${fechaCorta(perfil.fechaCierreBusqueda)}`
      : "Abierta",
  };
}

export function perfilesAbiertos(proyecto, hoy = new Date()) {
  return (proyecto.perfiles ?? []).filter(
    (perfil) => estadoDeBusqueda(perfil, proyecto, hoy).tipo === ESTADO_BUSQUEDA.ABIERTA,
  );
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
  REVISION_MANUAL: "El colectivo revisa cada postulación",
  TODO_SUMA: "Se acepta a todas las personas que se postulan",
  HASTA_LLENAR_VACANTES: "Se acepta automáticamente hasta completar el límite",
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
  return perfil?.modoAceptacion === "REVISION_MANUAL"
    ? "Tus datos de contacto se comparten solo si el colectivo acepta tu postulación."
    : "Este perfil acepta automáticamente: al enviar, el colectivo va a ver tus datos de contacto.";
}

export function esPostulacionActiva(estado) {
  return estado === "PENDIENTE" || estado === "ACEPTADA";
}

export function textoModoAceptacion(modo) {
  return TEXTO_MODO_ACEPTACION[modo] ?? "";
}

export function fechaLarga(fechaIso) {
  return FORMATO_FECHA_LARGA.format(new Date(fechaIso));
}

export function colaboracionesAceptadasDe(proyecto, perfil) {
  return (proyecto.colaboraciones ?? []).filter(
    (colaboracion) =>
      colaboracion.perfil === perfil.id && colaboracion.estado === "ACEPTADA",
  );
}

export function motivoNoPostulable(perfil, proyecto, hoy = new Date()) {
  if (proyecto.estado === "FINALIZADO") return "Este proyecto ya finalizó.";
  if (!perfil.busquedaAbierta) return "La búsqueda de este perfil está cerrada.";
  if (perfil.fechaCierreBusqueda && new Date(perfil.fechaCierreBusqueda) < hoy)
    return `La búsqueda de este perfil cerró el ${fechaCorta(perfil.fechaCierreBusqueda)}.`;
  if (
    perfil.limiteColaboraciones != null &&
    colaboracionesAceptadasDe(proyecto, perfil).length >= perfil.limiteColaboraciones
  )
    return "Este perfil ya completó su límite de colaboraciones.";
  return null;
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

export function postulacionesPendientes(proyecto) {
  if (!Array.isArray(proyecto.colaboraciones)) return null;
  return proyecto.colaboraciones.filter(
    (colaboracion) => colaboracion.estado === "PENDIENTE",
  ).length;
}
