import { useCallback } from "react";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { valoracionDependencies } from "@/Presentation/Dependencies/valoracionDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useGestionarColaboracion(proyectoId, colaboracionId) {
  const operar = useCallback(
    (_signal, accion, request) =>
      accion === "finalizar"
        ? colaboracionDependencies.finalizarColaboracion(proyectoId, colaboracionId)
        : valoracionDependencies.valorarColaboracion(proyectoId, colaboracionId, request),
    [proyectoId, colaboracionId],
  );
  return useMutacion(operar);
}
