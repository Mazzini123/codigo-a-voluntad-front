import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useProyecto(proyectoId, dependencies = proyectoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerProyecto(proyectoId, { signal }),
    [proyectoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(obtener);
  return { proyecto: datos, error, cargando, recargar: reintentar };
}
