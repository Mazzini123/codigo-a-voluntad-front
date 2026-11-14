import { useCallback, useMemo } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function usePedidosPendientes(dependencies = membresiaDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.listarColectivosConSolicitudPendiente({ signal }),
    [dependencies],
  );
  const { datos, reintentar } = useConsulta(obtener);
  const colectivos = useMemo(() => new Set(datos ?? []), [datos]);
  return { colectivos, actualizar: reintentar };
}
