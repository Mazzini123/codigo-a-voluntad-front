import { useCallback } from "react";
import { habilidadDependencies } from "../Dependencies/habilidadDependencies.js";
import { useAsync } from "./useAsync.js";

const POR_PAGINA = 10;

export function useHabilidades(pagina, dependencies = habilidadDependencies) {
  const listar = useCallback(
    (signal) =>
      dependencies.listarHabilidades({ page: pagina, limit: POR_PAGINA }, { signal }),
    [pagina, dependencies],
  );
  const { datos, error, cargando, reintentar } = useAsync(listar);
  return { resultado: datos, error, cargando, recargar: reintentar };
}
