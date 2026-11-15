import { TIPO_CONTEXTO } from "@/Application/Domain/Enums/TIPO_CONTEXTO.js";

export function participaEnElColectivo(usuario, colectivoId) {
  if (!colectivoId) return false;
  return (usuario?.contextos ?? []).some(
    (contexto) =>
      contexto.tipo === TIPO_CONTEXTO.COLECTIVO && contexto.colectivo?.id === colectivoId,
  );
}

export function postulanteVisible(colaboracion) {
  if (colaboracion?.esPublica === false) return null;
  return colaboracion?.colaborador ?? null;
}

export function esColaboracionPropia(usuario, colaboracion) {
  const colaboradorId = postulanteVisible(colaboracion)?.id;
  if (!colaboradorId) return false;
  return (usuario?.contextos ?? []).some(
    (contexto) =>
      contexto.tipo === TIPO_CONTEXTO.COLABORADOR &&
      contexto.colaborador?.id === colaboradorId,
  );
}
