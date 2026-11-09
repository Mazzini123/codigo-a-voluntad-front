import { useCallback, useMemo } from "react";
import { catalogoDependencies } from "@/Presentation/Dependencies/catalogoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { opcionesDeProvincias } from "@/Presentation/Formatos/colectivo.js";

export function useProvincias(dependencias = catalogoDependencies) {
  const consultar = useCallback(
    (signal) => dependencias.listarProvincias({ signal }),
    [dependencias],
  );
  const { datos } = useConsulta(consultar);
  return useMemo(() => opcionesDeProvincias(datos), [datos]);
}
