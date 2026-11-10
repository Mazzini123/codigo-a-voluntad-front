import { PERMISO } from "@/Application/Domain/Enums/PERMISO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { tienePermiso } from "@/Application/Domain/Reglas/permisos.js";
import {
  RUTA_MENSAJES,
  RUTA_MIEMBROS_COLECTIVO,
  RUTA_MIS_PROYECTOS,
  RUTA_PERFIL_COLABORADORA,
  RUTA_PERFIL_COLECTIVO,
  RUTA_POSTULACIONES_COLABORADORA,
  RUTA_POSTULACIONES_COLECTIVO,
  RUTA_PROYECTOS,
  RUTA_RESUMEN_COLECTIVO,
  RUTA_SOLICITUDES_COLECTIVO,
} from "./rutas.js";

export const MINIMO_ENLACES_PARA_MENU = 2;

const ENLACE_PROYECTOS = Object.freeze({ ruta: RUTA_PROYECTOS, texto: "Proyectos" });

const ENLACES_POR_ROL = Object.freeze({
  [ROL_CUENTA.COLABORADORA]: Object.freeze([
    ENLACE_PROYECTOS,
    Object.freeze({ ruta: RUTA_POSTULACIONES_COLABORADORA, texto: "Mis postulaciones" }),
    Object.freeze({ ruta: RUTA_MENSAJES, texto: "Mensajes" }),
  ]),
  [ROL_CUENTA.COLECTIVO]: Object.freeze([
    ENLACE_PROYECTOS,
    Object.freeze({
      ruta: RUTA_RESUMEN_COLECTIVO,
      texto: "Panel del colectivo",
      tambienActivoEn: Object.freeze([
        RUTA_MIS_PROYECTOS,
        RUTA_POSTULACIONES_COLECTIVO,
        RUTA_MIEMBROS_COLECTIVO,
        RUTA_SOLICITUDES_COLECTIVO,
      ]),
    }),
  ]),
});

export const SECCIONES_DEL_PANEL = Object.freeze([
  Object.freeze({ ruta: RUTA_RESUMEN_COLECTIVO, texto: "Resumen", icono: "inicio" }),
  Object.freeze({ ruta: RUTA_MIS_PROYECTOS, texto: "Mis proyectos", icono: "carpeta" }),
  Object.freeze({
    ruta: RUTA_POSTULACIONES_COLECTIVO,
    texto: "Postulaciones",
    icono: "lista",
  }),
  Object.freeze({ ruta: RUTA_MIEMBROS_COLECTIVO, texto: "Miembros", icono: "personas" }),
  Object.freeze({
    ruta: RUTA_SOLICITUDES_COLECTIVO,
    texto: "Solicitudes",
    icono: "personas",
    permiso: PERMISO.COLECTIVO_MIEMBROS_VER,
  }),
]);

export function seccionesDelPanelPara(cuenta) {
  return SECCIONES_DEL_PANEL.filter(
    ({ permiso }) => !permiso || tienePermiso(cuenta, permiso),
  );
}

export function estaActivo({ ruta, tambienActivoEn = [] }, pathname) {
  return [ruta, ...tambienActivoEn].some(
    (candidata) => pathname === candidata || pathname.startsWith(`${candidata}/`),
  );
}

const ENLACES_BASE = Object.freeze([ENLACE_PROYECTOS]);

export function enlacesPrincipalesPara(rol) {
  return ENLACES_POR_ROL[rol] ?? ENLACES_BASE;
}

const ENLACE_DE_PERFIL = Object.freeze({
  [ROL_CUENTA.COLECTIVO]: Object.freeze({
    ruta: RUTA_PERFIL_COLECTIVO,
    texto: "Mi colectivo",
  }),
  [ROL_CUENTA.COLABORADORA]: Object.freeze({
    ruta: RUTA_PERFIL_COLABORADORA,
    texto: "Mi perfil",
  }),
});

export function enlaceDePerfilPara(rol) {
  return ENLACE_DE_PERFIL[rol] ?? null;
}
