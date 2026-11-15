import { useMasResultados } from "@/Presentation/Hooks/comunes/useMasResultados.js";
import { useCallback, useMemo } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useProyecto(proyectoId, dependencies = proyectoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerProyecto(proyectoId, { signal }),
    [proyectoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(obtener);
  const listarMas = useCallback(
    (query, signal) =>
      dependencies.listarParticipaciones(proyectoId, {
        ...query,
        signal,
        privadas: Boolean(datos?.colaboracionesMeta?.privadas),
      }),
    [dependencies, proyectoId, datos?.colaboracionesMeta?.privadas],
  );
  const participaciones = useMasResultados(
    datos?.colaboraciones,
    datos?.colaboracionesMeta,
    listarMas,
  );
  const proyecto = useMemo(
    () => (datos ? { ...datos, colaboraciones: participaciones.items } : datos),
    [datos, participaciones.items],
  );
  return { proyecto, participaciones, error, cargando, recargar: reintentar };
}
