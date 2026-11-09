import { useCallback } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useDarDeBajaColectivo(id, dependencies = colectivoDependencies) {
  const darDeBaja = useCallback(
    () => dependencies.darDeBajaColectivo(id),
    [id, dependencies],
  );
  return useMutacion(darDeBaja);
}
