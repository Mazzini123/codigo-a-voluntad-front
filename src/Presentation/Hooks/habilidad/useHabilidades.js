import { useCallback } from "react";
import { habilidadDependencies } from "@/Presentation/Dependencies/habilidadDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

const POR_PAGINA = 10;

export function useHabilidades(pagina, dependencies = habilidadDependencies) {
  const listar = useCallback(
    (signal) =>
      dependencies.listarHabilidades({ page: pagina, limit: POR_PAGINA }, { signal }),
    [pagina, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(listar);
  return { resultado: datos, error, cargando, recargar: reintentar };
}
