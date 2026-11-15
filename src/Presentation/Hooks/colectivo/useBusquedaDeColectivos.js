import { useCallback } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export const COLECTIVOS_POR_PAGINA = 12;

export function useBusquedaDeColectivos(
  { busqueda, pagina, clave },
  dependencies = colectivoDependencies,
) {
  const buscar = useCallback(
    async (signal) => {
      const query = { page: pagina, limit: COLECTIVOS_POR_PAGINA };
      if (busqueda) query.q = busqueda;
      const resultado = await dependencies.listarColectivos(query, { signal });
      return { ...resultado, consulta: clave };
    },
    [busqueda, pagina, clave, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(buscar);
  return { resultado: datos, error, cargando, reintentar };
}
