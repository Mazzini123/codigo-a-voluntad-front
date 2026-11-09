import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useProyectosDelColectivo(
  colectivoId,
  dependencies = proyectoDependencies,
) {
  const listar = useCallback(
    (signal) => dependencies.listarProyectosDeColectivo(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, error, reintentar } = useConsulta(listar);
  return { proyectos: datos, error, recargar: reintentar };
}
