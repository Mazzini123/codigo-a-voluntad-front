import { useCallback } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useColectivo(colectivoId, dependencies = colectivoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerColectivo(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(obtener);
  return { colectivo: datos, error, cargando, recargar: reintentar };
}
