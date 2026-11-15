import { useCallback } from "react";
import { habilidadDependencies } from "@/Presentation/Dependencies/habilidadDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

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
        todas.push(...resultado.items);
        if (pagina >= resultado.totalPaginas) break;
      }
      return todas
        .filter((habilidad) => habilidad.activo)
        .sort((a, b) => a.titulo.localeCompare(b.titulo, "es"));
    },
    [dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(listarTodas);
  return { habilidades: datos, error, cargando, recargar: reintentar };
}
