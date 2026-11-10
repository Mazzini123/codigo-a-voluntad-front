import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";

export function puedePedirIngreso(usuario, colectivo) {
  if (!usuario?.usuarioId || colectivo.fechaBaja) return false;
  const contextos = usuario.contextos ?? [];
  if (contextos.some(({ tipo }) => tipo === TIPO_CONTEXTO.COLABORADOR)) return false;
  return !contextos.some((contexto) => contexto.colectivo?.id === colectivo.id);
}
