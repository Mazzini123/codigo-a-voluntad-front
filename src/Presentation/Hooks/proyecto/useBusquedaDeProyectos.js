import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { reclutamientoDependencies } from "@/Presentation/Dependencies/reclutamientoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { VISTA } from "./useParametrosDeBusqueda.js";

export const PROYECTOS_POR_PAGINA = 12;

const DEPENDENCIAS = Object.freeze({
  proyectos: proyectoDependencies,
  reclutamiento: reclutamientoDependencies,
});

export function useBusquedaDeProyectos(
  { vista, etiqueta, pagina, colaboradoraId, listo = true },
  dependencias = DEPENDENCIAS,
) {
  const buscar = useCallback(
    async (signal) => {
      if (!listo) return null;
      const query = { page: pagina, limit: PROYECTOS_POR_PAGINA };
      const resultado =
        vista === VISTA.PARA_VOS
          ? await dependencias.reclutamiento.buscarProyectosPotenciales(
              colaboradoraId,
              query,
              {
                signal,
              },
            )
          : await dependencias.proyectos.listarProyectos(
              etiqueta ? { ...query, etiqueta } : query,
              { signal },
            );
      return { ...resultado, consulta: `${vista}|${etiqueta}` };
    },
    [vista, etiqueta, pagina, colaboradoraId, listo, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(buscar);
  return { resultado: datos, error, cargando: cargando || !listo, reintentar };
}
