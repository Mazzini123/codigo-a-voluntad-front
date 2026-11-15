import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useProyectosDestacados(dependencies = proyectoDependencies) {
  const consultar = useCallback(
    (signal) => dependencies.listarProyectosDestacados({ signal }),
    [dependencies],
  );
  return useConsulta(consultar);
}
