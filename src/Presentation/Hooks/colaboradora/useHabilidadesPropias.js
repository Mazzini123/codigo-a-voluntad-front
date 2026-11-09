import { useCallback, useMemo } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useHabilidadesPropias(
  colaboradoraId,
  dependencies = colaboradorDependencies,
) {
  const obtener = useCallback(
    async (signal) =>
      colaboradoraId ? dependencies.obtenerColaborador(colaboradoraId, { signal }) : null,
    [colaboradoraId, dependencies],
  );
  const { datos } = useConsulta(obtener);
  return useMemo(
    () =>
      datos ? new Set(datos.habilidades.map((habilidad) => habilidad.codigo)) : null,
    [datos],
  );
}
