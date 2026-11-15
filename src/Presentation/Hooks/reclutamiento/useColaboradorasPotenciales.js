import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { reclutamientoDependencies } from "@/Presentation/Dependencies/reclutamientoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export const CANDIDATAS_POR_PAGINA = 12;

const DEPENDENCIAS = Object.freeze({
  proyectos: proyectoDependencies,
  reclutamiento: reclutamientoDependencies,
});

export function useColaboradorasPotenciales(
  proyectoId,
  perfilId,
  pagina,
  dependencias = DEPENDENCIAS,
) {
  const consultar = useCallback(
    (signal) =>
      Promise.all([
        dependencias.proyectos.obtenerProyecto(proyectoId, { signal }),
        dependencias.reclutamiento.buscarColaboradorasPotenciales(
          proyectoId,
          perfilId,
          { page: pagina, limit: CANDIDATAS_POR_PAGINA },
          { signal },
        ),
      ]),
    [proyectoId, perfilId, pagina, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(consultar);
  const [proyecto, resultado] = datos ?? [null, null];
  const perfil = proyecto?.perfiles?.find(({ id }) => id === perfilId) ?? null;

  return {
    proyecto,
    perfil,
    resultado,
    error,
    cargando: cargando && !datos,
    cargandoPagina: cargando && Boolean(datos),
    reintentar,
  };
}
