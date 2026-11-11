import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { usePagina } from "@/Presentation/Hooks/comunes/usePagina.js";
export function useProyectosDelColectivo(
  colectivoId,
  dependencies = proyectoDependencies,
) {
  const listar = useCallback(
    (query, signal) =>
      dependencies.listarProyectosDeColectivo(colectivoId, { ...query, signal }),
    [colectivoId, dependencies],
  );
  const consulta = usePagina(listar);
  return { ...consulta, proyectos: consulta.items, recargar: consulta.reintentar };
}
