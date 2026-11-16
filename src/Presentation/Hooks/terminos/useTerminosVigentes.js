import { useCallback } from "react";
import { terminosDependencies } from "@/Presentation/Dependencies/terminosDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export function useTerminosVigentes(dependencies = terminosDependencies) {
  const consultar = useCallback(
    (signal) => dependencies.obtenerTerminosVigentes({ signal }),
    [dependencies],
  );
  const { datos, error, cargando, reintentar } = useConsulta(consultar);
  return {
    terminos: datos,
    cargando,
    error,
    recargar: reintentar,
  };
}
