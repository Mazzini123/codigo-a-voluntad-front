import { useCallback } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useAbandonarColectivo(colectivoId, dependencies = membresiaDependencies) {
  const abandonar = useCallback(
    () => dependencies.abandonarColectivo(colectivoId),
    [colectivoId, dependencies],
  );
  return useMutacion(abandonar);
}
