import { useCallback } from "react";
import { colaboradorDependencies } from "../Dependencies/colaboradorDependencies.js";
import { useAsync } from "./useAsync.js";

export function useColaboradora(colaboradoraId, dependencies = colaboradorDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.obtenerColaborador(colaboradoraId, { signal }),
    [colaboradoraId, dependencies],
  );
  const { datos, error, cargando, reintentar } = useAsync(obtener);
  return { colaboradora: datos, error, cargando, recargar: reintentar };
}
