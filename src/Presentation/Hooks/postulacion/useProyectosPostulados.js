import { esPostulacionActiva } from "@/Application/Domain/Reglas/busquedaDePerfil.js";
import { useMemo } from "react";
import { usePostulacionesPropias } from "./usePostulacionesEnProyecto.js";

export function useProyectosPostulados(colaboradoraId) {
  const { items, error } = usePostulacionesPropias(colaboradoraId);
  return useMemo(() => {
    const porProyecto = new Map();
    if (!colaboradoraId || error) return porProyecto;
    for (const { proyectoId, colaboracion } of items) {
      if (!esPostulacionActiva(colaboracion.estado)) continue;
      if (!porProyecto.has(proyectoId)) porProyecto.set(proyectoId, []);
      porProyecto
        .get(proyectoId)
        .push({ perfilId: colaboracion.perfil, estado: colaboracion.estado });
    }
    return porProyecto;
  }, [colaboradoraId, error, items]);
}
