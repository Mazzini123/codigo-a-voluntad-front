import { useCallback } from "react";
import { colectivoDependencies } from "../Dependencies/colectivoDependencies.js";
import { useAsync } from "./useAsync.js";

export function useColectivo(colectivoId, dependencies = colectivoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerColectivo(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useAsync(obtener);
  return { colectivo: datos, error, cargando, recargar: reintentar };
}
