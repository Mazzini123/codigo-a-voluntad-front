import { useCallback } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useReactivarColaboradora(
  colaboradorId,
  dependencies = colaboradorDependencies,
) {
  const tarea = useCallback(
    () => dependencies.reactivarColaborador(colaboradorId),
    [colaboradorId, dependencies],
  );
  return useMutacion(tarea);
}
