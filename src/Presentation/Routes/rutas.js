export const RUTA_BIENVENIDA = "/bienvenida";
export const RUTA_MIS_PROYECTOS = "/colectivo/proyectos";
export const RUTA_NUEVO_PROYECTO = "/colectivo/proyectos/nuevo";
export const RUTA_ADMINISTRAR_PROYECTO = "/proyectos/:id/administrar";
export const RUTA_POSTULACIONES_RECIBIDAS = "/proyectos/:id/postulaciones";

export function rutaPostulacionesRecibidas(id) {
  return RUTA_POSTULACIONES_RECIBIDAS.replace(":id", encodeURIComponent(id));
}

export function rutaAdministrarProyecto(id) {
  return RUTA_ADMINISTRAR_PROYECTO.replace(":id", encodeURIComponent(id));
}

const INICIO_POR_ROL = Object.freeze({
  COLECTIVO: RUTA_MIS_PROYECTOS,
  COLABORADORA: "/proyectos",
});

export function inicioPorRol(rol) {
  return rol ? (INICIO_POR_ROL[rol] ?? "/proyectos") : RUTA_BIENVENIDA;
}

export function estadoParaVolver(ubicacion, textoVolver) {
  return {
    volverA: rutaDe(ubicacion),
    estadoDeVuelta: ubicacion.state ?? null,
    textoVolver,
  };
}

export function destinoDeVuelta(ubicacion, { a, texto }) {
  const origen = ubicacion.state;
  if (!origen?.volverA) return { a, state: undefined, texto };
  return {
    a: origen.volverA,
    state: origen.estadoDeVuelta ?? undefined,
    texto: origen.textoVolver ?? texto,
  };
}

export function rutaDe(ubicacion) {
  if (!ubicacion?.pathname) return null;
  return `${ubicacion.pathname}${ubicacion.search ?? ""}${ubicacion.hash ?? ""}`;
}
