import { matchPath } from "react-router-dom";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";
import {
  PASO_DE_REGISTRO,
  pasoDeRegistro,
} from "@/Application/Domain/Reglas/registro.js";

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
export const RUTA_ALTA_COLECTIVO = "/bienvenida/colectivo/nuevo";
export const RUTA_UNIRME_A_COLECTIVO = "/bienvenida/colectivo/unirme";
export const RUTA_ALTA_COLABORADORA = "/bienvenida/colaboradora";
export const RUTA_NOMBRE = "/cuenta/nombre";
export const RUTA_MIS_SOLICITUDES = "/cuenta/solicitudes";
export const RUTA_PERFIL_COLECTIVO = "/colectivo/perfil";
export const RUTA_PERFIL_COLABORADORA = "/colaboradora/perfil";
export const RUTA_POSTULACIONES_COLABORADORA = "/colaboradora/postulaciones";
export const RUTA_MENSAJES = "/mensajes";
export const RUTA_RESUMEN_COLECTIVO = "/colectivo/resumen";
export const RUTA_MIS_PROYECTOS = "/colectivo/proyectos";
export const RUTA_POSTULACIONES_COLECTIVO = "/colectivo/postulaciones";
export const RUTA_MIEMBROS_COLECTIVO = "/colectivo/miembros";
export const RUTA_SOLICITUDES_COLECTIVO = "/colectivo/solicitudes";
export const RUTA_NUEVO_PROYECTO = "/colectivo/proyectos/nuevo";
export const RUTA_ADMIN = "/admin";
export const RUTA_ADMIN_DESTACADOS = "/admin/destacados";
export const RUTA_ADMIN_REVISIONES = "/admin/revisiones";
export const RUTA_ADMIN_AUDITORIA = "/admin/auditoria";
export const RUTA_ADMIN_TERMINOS = "/admin/terminos";
export const RUTA_ADMIN_BAJAS = "/admin/bajas";
export const RUTA_TERMINOS = "/terminos";
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
  [ROL_CUENTA.ADMINISTRACION]: RUTA_ADMIN,
});

const ROL_POR_TIPO_DE_CONTEXTO = Object.freeze({
  [TIPO_CONTEXTO.COLECTIVO]: ROL_CUENTA.COLECTIVO,
  [TIPO_CONTEXTO.ADMINISTRACION]: ROL_CUENTA.ADMINISTRACION,
});

export function inicioPorRol(rol) {
  return rol ? (INICIO_POR_ROL[rol] ?? RUTA_PROYECTOS) : RUTA_BIENVENIDA;
}

export function inicioPorContexto(contexto) {
  if (!contexto) return RUTA_BIENVENIDA;
  return inicioPorRol(ROL_POR_TIPO_DE_CONTEXTO[contexto.tipo] ?? ROL_CUENTA.COLABORADORA);
}

const RUTAS_DEL_PASO = Object.freeze({
  [PASO_DE_REGISTRO.NOMBRE]: Object.freeze([RUTA_NOMBRE]),
  [PASO_DE_REGISTRO.MODALIDAD]: Object.freeze([
    RUTA_BIENVENIDA,
    RUTA_ALTA_COLECTIVO,
    RUTA_UNIRME_A_COLECTIVO,
    RUTA_ALTA_COLABORADORA,
    RUTA_MIS_SOLICITUDES,
    RUTA_NOMBRE,
  ]),
  [PASO_DE_REGISTRO.ESPERA]: Object.freeze([
    RUTA_MIS_SOLICITUDES,
    RUTA_UNIRME_A_COLECTIVO,
    RUTA_ALTA_COLECTIVO,
    RUTA_NOMBRE,
  ]),
});

const PASOS_CON_PERFIL_PUBLICO_DE_COLECTIVO = Object.freeze([
  PASO_DE_REGISTRO.MODALIDAD,
  PASO_DE_REGISTRO.ESPERA,
]);

function esPerfilPublicoDeColectivo(pathname) {
  return Boolean(matchPath({ path: RUTA_COLECTIVO, end: true }, pathname));
}

function pasoPermiteLaRuta(paso, pathname) {
  if (RUTAS_DEL_PASO[paso]?.includes(pathname)) return true;
  return (
    PASOS_CON_PERFIL_PUBLICO_DE_COLECTIVO.includes(paso) &&
    esPerfilPublicoDeColectivo(pathname)
  );
}

export function rutaDelPasoDeRegistro(cuenta) {
  return RUTAS_DEL_PASO[pasoDeRegistro(cuenta)]?.[0] ?? null;
}

export function rutaPendienteDelRegistro(cuenta, pathname) {
  const paso = pasoDeRegistro(cuenta);
  const permitidas = RUTAS_DEL_PASO[paso];
  if (!permitidas || pathname === RUTA_CALLBACK) return null;
  return pasoPermiteLaRuta(paso, pathname) ? null : permitidas[0];
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
