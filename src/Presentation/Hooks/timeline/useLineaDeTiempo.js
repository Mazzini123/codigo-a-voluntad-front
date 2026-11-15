import { useCallback } from "react";
import { timelineDependencies } from "@/Presentation/Dependencies/timelineDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useLineaDeTiempo(id, dependencies = timelineDependencies) {
  const consultar = useCallback(
    async (signal) => {
      const eventos = await dependencies.obtenerTimelineDeColectivo(id, { signal });
      return [...eventos].sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
    },
    [id, dependencies],
  );
  return useConsulta(consultar);
}
