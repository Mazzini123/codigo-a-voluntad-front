import { useMasResultados } from "@/Presentation/Hooks/comunes/useMasResultados.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useCallback, useMemo } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useColectivo(colectivoId, dependencies = colectivoDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerColectivo(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(obtener);
  const listarMas = useCallback(
    (query, signal) =>
      proyectoDependencies.listarProyectosDeColectivo(colectivoId, {
        ...query,
        signal,
        requiereSesion: false,
      }),
    [colectivoId],
  );
  const proyectos = useMasResultados(datos?.proyectos, datos?.proyectosMeta, listarMas);
  const colectivo = useMemo(
    () => (datos ? { ...datos, proyectos: proyectos.items } : datos),
    [datos, proyectos.items],
  );
  return { colectivo, proyectos, error, cargando, recargar: reintentar };
}
