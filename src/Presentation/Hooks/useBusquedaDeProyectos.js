import { useCallback } from "react";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { reclutamientoDependencies } from "../Dependencies/reclutamientoDependencies.js";
import { useAsync } from "./useAsync.js";
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
  const { datos, error, cargando, reintentar } = useAsync(buscar);
  return { resultado: datos, error, cargando: cargando || !listo, reintentar };
}
