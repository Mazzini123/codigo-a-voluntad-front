import { useCallback } from "react";
import { valoracionDependencies } from "@/Presentation/Dependencies/valoracionDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useValoraciones(id, esColectivo, dependencies = valoracionDependencies) {
  const consultar = useCallback(
    (signal) =>
      (esColectivo
        ? dependencies.obtenerValoracionesDeColectivo
        : dependencies.obtenerValoracionesDeColaborador)(id, { signal }),
    [id, esColectivo, dependencies],
  );
  return useConsulta(consultar);
}
