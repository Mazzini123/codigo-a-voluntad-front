import { useCallback } from "react";
import { habilidadDependencies } from "../Dependencies/habilidadDependencies.js";
import { useAsync } from "./useAsync.js";

const POR_PAGINA = 100;

export function useCatalogoDeHabilidades(dependencies = habilidadDependencies) {
  const listarTodas = useCallback(
    async (signal) => {
      const todas = [];
      for (let pagina = 1; ; pagina += 1) {
        const resultado = await dependencies.listarHabilidades(
          { page: pagina, limit: POR_PAGINA },
          { signal },
        );
        todas.push(...resultado.data);
        if (pagina >= resultado.meta.total_pages) break;
      }
      return todas
        .filter((habilidad) => habilidad.activo)
        .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
    },
    [dependencies],
  );
  const { datos, error, cargando, reintentar } = useAsync(listarTodas);
  return { habilidades: datos, error, cargando, recargar: reintentar };
}
