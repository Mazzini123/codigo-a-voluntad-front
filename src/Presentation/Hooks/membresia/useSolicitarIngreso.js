import { useCallback } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useSolicitarIngreso(colectivoId, dependencies = membresiaDependencies) {
  const solicitar = useCallback(
    () => dependencies.solicitarIngreso(colectivoId),
    [colectivoId, dependencies],
  );
  return useMutacion(solicitar);
}
