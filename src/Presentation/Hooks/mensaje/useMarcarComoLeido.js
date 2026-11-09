import { useCallback } from "react";
import { notificacionDependencies } from "@/Presentation/Dependencies/notificacionDependencies.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useMarcarComoLeido(
  colaboradorId,
  notificacionId,
  dependencias = notificacionDependencies,
) {
  const marcar = useCallback(
    (signal) =>
      dependencias.marcarNotificacionComoLeida(colaboradorId, notificacionId, {
        signal,
      }),
    [colaboradorId, notificacionId, dependencias],
  );
  const { ejecutar, enviando } = useMutacion(marcar);

  return { marcarComoLeido: ejecutar, marcando: enviando };
}
