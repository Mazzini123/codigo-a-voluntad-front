import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";

export const RUTA_INICIO = "/";
export const RUTA_COMO_EMPEZAR = "/#como-empezar";
export const RUTA_PROYECTOS = "/proyectos";
export const RUTA_PROYECTO = "/proyectos/:id";
export const RUTA_AVANCE_DEL_PROYECTO = "/proyectos/:id/avance";
export const RUTA_COLECTIVO = "/colectivos/:id";
export const RUTA_COLABORADORA = "/colaboradoras/:id";
export const RUTA_LOGIN = "/login";
export const RUTA_REGISTRO = "/registro";
export const RUTA_CALLBACK = "/auth/callback";
export const RUTA_SIN_PERMISO = "/sin-permiso";
export const RUTA_HABILIDADES = "/habilidades";
export const RUTA_BIENVENIDA = "/bienvenida";
export const RUTA_ALTA_COLECTIVO = "/bienvenida/colectivo";
export const RUTA_ALTA_COLABORADORA = "/bienvenida/colaboradora";
export const RUTA_PERFIL_COLECTIVO = "/colectivo/perfil";
export const RUTA_PERFIL_COLABORADORA = "/colaboradora/perfil";
export const RUTA_POSTULACIONES_COLABORADORA = "/colaboradora/postulaciones";
export const RUTA_MENSAJES = "/mensajes";
export const RUTA_RESUMEN_COLECTIVO = "/colectivo/resumen";
export const RUTA_MIS_PROYECTOS = "/colectivo/proyectos";
export const RUTA_POSTULACIONES_COLECTIVO = "/colectivo/postulaciones";
export const RUTA_NUEVO_PROYECTO = "/colectivo/proyectos/nuevo";
export const RUTA_ADMINISTRAR_PROYECTO = "/proyectos/:id/administrar";
export const RUTA_POSTULACIONES_RECIBIDAS = "/proyectos/:id/postulaciones";
export const RUTA_COLABORADORAS_POTENCIALES =
  "/proyectos/:id/perfiles/:perfilId/colaboradoras";
export const RUTA_CONTACTO_DE_COLABORADORA =
  "/proyectos/:id/colaboradoras/:colaboradorId/contacto";

function conId(ruta, id) {
  return ruta.replace(":id", encodeURIComponent(id));
}

export function rutaProyecto(id) {
  return conId(RUTA_PROYECTO, id);
}

export function rutaAvanceDelProyecto(id) {
  return conId(RUTA_AVANCE_DEL_PROYECTO, id);
}

export function rutaColectivo(id) {
  return conId(RUTA_COLECTIVO, id);
}

export function rutaColaboradora(id) {
  return conId(RUTA_COLABORADORA, id);
}

export function rutaPostulacionesRecibidas(id) {
  return conId(RUTA_POSTULACIONES_RECIBIDAS, id);
}

export function rutaColaboradorasPotenciales(id, perfilId) {
  return conId(RUTA_COLABORADORAS_POTENCIALES, id).replace(
    ":perfilId",
    encodeURIComponent(perfilId),
  );
}

export function rutaContactoDeColaboradora(id, colaboradorId) {
  return conId(RUTA_CONTACTO_DE_COLABORADORA, id).replace(
    ":colaboradorId",
    encodeURIComponent(colaboradorId),
  );
}

export function rutaAdministrarProyecto(id) {
  return conId(RUTA_ADMINISTRAR_PROYECTO, id);
}

export function esRutaDeAcceso(pathname) {
  return pathname === RUTA_LOGIN || pathname === RUTA_REGISTRO;
}

export const TIPO_DE_PANTALLA = Object.freeze({
  INICIO: "inicio",
  EXPLORACION: "exploracion",
  ACCESO: "acceso",
  PANEL: "panel",
});

const INICIO_POR_ROL = Object.freeze({
  [ROL_CUENTA.COLECTIVO]: RUTA_RESUMEN_COLECTIVO,
  [ROL_CUENTA.COLABORADORA]: RUTA_PROYECTOS,
});

export function inicioPorRol(rol) {
  return rol ? (INICIO_POR_ROL[rol] ?? RUTA_PROYECTOS) : RUTA_BIENVENIDA;
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
