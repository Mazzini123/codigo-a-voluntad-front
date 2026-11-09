import { useCallback } from "react";
import { estadisticaDependencies } from "@/Presentation/Dependencies/estadisticaDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useEstadisticasGlobales(dependencies = estadisticaDependencies) {
  const consultar = useCallback(
    async (signal) => {
      const datos = await dependencies.obtenerEstadisticasGlobales({ signal });
      if (
        !datos?.colectivos ||
        !datos?.proyectos ||
        !datos?.colaboradores ||
        !datos?.colaboraciones
      )
        throw new Error("No pudimos leer las estadísticas.");
      return datos;
    },
    [dependencies],
  );
  return useConsulta(consultar);
}

export function useEstadisticasDelColectivo(id, dependencies = estadisticaDependencies) {
  const consultar = useCallback(
    async (signal) => {
      const datos = await dependencies.obtenerEstadisticasDeColectivo(id, { signal });
      if (
        !datos?.proyectos ||
        !datos?.colaboraciones ||
        !Array.isArray(datos?.porProyecto)
      )
        throw new Error("No pudimos leer las estadísticas del colectivo.");
      return datos;
    },
    [id, dependencies],
  );
  return useConsulta(consultar);
}
