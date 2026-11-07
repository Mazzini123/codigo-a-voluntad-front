import { useCallback } from "react";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { useAsync } from "./useAsync.js";

export function useProyecto(proyectoId, dependencies = proyectoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerProyecto(proyectoId, { signal }),
    [proyectoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useAsync(obtener);
  return { proyecto: datos, error, cargando, recargar: reintentar };
}
