import { ROL_EN_CONTEXTO } from "@/Application/Domain/Enums/ROL_EN_CONTEXTO.js";
import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";

const ROLES = {
  [ROL_EN_CONTEXTO.LIDER]: "Coordinadora",
  [ROL_EN_CONTEXTO.MIEMBRO]: "Miembro",
};

export function nombreDelContexto(contexto) {
  if (contexto.tipo === TIPO_CONTEXTO.ADMINISTRACION) {
    return "Administración de la plataforma";
  }
  if (contexto.tipo === TIPO_CONTEXTO.COLECTIVO) {
    return contexto.colectivo?.nombre ?? "Colectivo";
  }
  return contexto.colaborador?.nombre ?? "Mi perfil de colaboradora";
}

export function detalleDelContexto(contexto) {
  if (contexto.tipo === TIPO_CONTEXTO.ADMINISTRACION) {
    return "Plataforma · Administradora";
  }
  if (contexto.tipo === TIPO_CONTEXTO.COLECTIVO) {
    return `Colectivo · ${ROLES[contexto.rol] ?? "Miembro"}`;
  }
  return "Colaboradora";
}
