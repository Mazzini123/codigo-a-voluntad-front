import { useCallback } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useColaboradora(colaboradoraId, dependencies = colaboradorDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerColaborador(colaboradoraId, { signal }),
    [colaboradoraId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(obtener);
  return { colaboradora: datos, error, cargando, recargar: reintentar };
}
