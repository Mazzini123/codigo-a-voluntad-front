import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { RUTA_MIS_PROYECTOS } from "./rutas.js";

export const MINIMO_ENLACES_PARA_MENU = 2;

const ENLACE_PROYECTOS = Object.freeze({ ruta: "/proyectos", texto: "Proyectos" });

const ENLACES_POR_ROL = Object.freeze({
  [ROL_CUENTA.COLECTIVO]: Object.freeze([
    ENLACE_PROYECTOS,
    Object.freeze({ ruta: RUTA_MIS_PROYECTOS, texto: "Mis proyectos" }),
  ]),
});

const ENLACES_BASE = Object.freeze([ENLACE_PROYECTOS]);

export function enlacesPrincipalesPara(rol) {
  return ENLACES_POR_ROL[rol] ?? ENLACES_BASE;
}

const ENLACE_DE_PERFIL = Object.freeze({
  COLECTIVO: Object.freeze({ ruta: "/colectivo/perfil", texto: "Mi colectivo" }),
  COLABORADORA: Object.freeze({ ruta: "/colaboradora/perfil", texto: "Mi perfil" }),
});

export function enlaceDePerfilPara(rol) {
  return ENLACE_DE_PERFIL[rol] ?? null;
}
