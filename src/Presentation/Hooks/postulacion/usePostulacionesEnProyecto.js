import { useCallback, useMemo } from "react";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

const ESTADOS_VISIBLES = new Set([
  COLABORACION_ESTADO.PENDIENTE,
  COLABORACION_ESTADO.ACEPTADA,
  COLABORACION_ESTADO.RECHAZADA,
]);

export function usePostulacionesPropias(
  colaboradoraId,
  dependencies = colaboracionDependencies,
) {
  const listar = useCallback(
    async (signal) =>
      colaboradoraId
        ? dependencies.listarColaboracionesDeColaborador(colaboradoraId, {
            signal,
            requiereSesion: true,
          })
        : null,
    [colaboradoraId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(listar);
  const items = useMemo(
    () => (datos ?? []).filter((item) => ESTADOS_VISIBLES.has(item.colaboracion.estado)),
    [datos],
  );
  return { items, error, cargando: cargando && !datos, recargar: reintentar };
}

export function usePostulacionesEnProyecto(
  colaboradoraId,
  proyectoId,
  dependencies = colaboracionDependencies,
) {
  const { items, error, cargando, recargar } = usePostulacionesPropias(
    colaboradoraId,
    dependencies,
  );
  const postulaciones = useMemo(
    () =>
      items
        .filter((item) => item.proyectoId === proyectoId)
        .map((item) => item.colaboracion),
    [items, proyectoId],
  );
  return { postulaciones, error, cargando, recargar };
}
