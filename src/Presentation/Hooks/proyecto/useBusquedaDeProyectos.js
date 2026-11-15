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
  { vista, etiqueta, filtros = {}, clave, pagina, colaboradoraId, listo = true },
  dependencias = DEPENDENCIAS,
) {
  const buscar = useCallback(
    async (signal) => {
      if (!listo) return null;
      const query = { page: pagina, limit: PROYECTOS_POR_PAGINA };
      const condiciones = Object.fromEntries(
        Object.entries({ etiqueta, ...filtros }).filter(([, valor]) => valor),
      );
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
              { ...query, ...condiciones },
              { signal },
            );
      return { ...resultado, consulta: clave ?? `${vista}|${etiqueta}` };
    },
    [vista, etiqueta, filtros, clave, pagina, colaboradoraId, listo, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(buscar);
  return { resultado: datos, error, cargando: cargando || !listo, reintentar };
}
