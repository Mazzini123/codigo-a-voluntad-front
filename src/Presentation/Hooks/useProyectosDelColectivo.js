import { useCallback } from "react";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { useAsync } from "./useAsync.js";

export function useProyectosDelColectivo(
  colectivoId,
  dependencies = proyectoDependencies,
) {
  const listar = useCallback(
    (signal) => dependencies.listarProyectosDeColectivo(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, error, reintentar } = useAsync(listar);
  return { proyectos: datos, error, recargar: reintentar };
}
