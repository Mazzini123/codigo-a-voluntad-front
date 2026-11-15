import { useCallback } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useDarDeBajaColaboradora(
  colaboradorId,
  dependencies = colaboradorDependencies,
) {
  const tarea = useCallback(
    () => dependencies.darDeBajaColaborador(colaboradorId),
    [colaboradorId, dependencies],
  );
  return useMutacion(tarea);
}
