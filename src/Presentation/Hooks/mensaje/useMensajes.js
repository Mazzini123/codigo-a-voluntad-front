import { useCallback } from "react";
import { notificacionDependencies } from "@/Presentation/Dependencies/notificacionDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export const MENSAJES_POR_PAGINA = 10;

export function useMensajes(
  colaboradorId,
  pagina,
  soloSinLeer = false,
  dependencias = notificacionDependencies,
) {
  const consultar = useCallback(
    (signal) =>
      dependencias.listarNotificaciones(
        colaboradorId,
        {
          page: pagina,
          limit: MENSAJES_POR_PAGINA,
          ...(soloSinLeer && { leida: false }),
        },
        { signal },
      ),
    [colaboradorId, pagina, soloSinLeer, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(consultar);

  return {
    resultado: datos,
    error,
    cargando: cargando && !datos,
    cargandoPagina: cargando && Boolean(datos),
    reintentar,
  };
}
