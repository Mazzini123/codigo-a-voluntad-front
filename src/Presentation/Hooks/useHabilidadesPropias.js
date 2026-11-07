import { useCallback, useMemo } from "react";
import { colaboradorDependencies } from "../Dependencies/colaboradorDependencies.js";
import { useAsync } from "./useAsync.js";

export function useHabilidadesPropias(
  colaboradoraId,
  dependencies = colaboradorDependencies,
) {
  const obtener = useCallback(
    async (signal) =>
      colaboradoraId ? dependencies.obtenerColaborador(colaboradoraId, { signal }) : null,
    [colaboradoraId, dependencies],
  );
  const { datos } = useAsync(obtener);
  return useMemo(
    () =>
      datos ? new Set(datos.habilidades.map((habilidad) => habilidad.codigo)) : null,
    [datos],
  );
}
