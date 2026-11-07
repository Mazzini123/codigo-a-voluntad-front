import { useCallback } from "react";
import { habilidadDependencies } from "../Dependencies/habilidadDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAvisos } from "./useAvisos.js";

export function useCrearHabilidad(dependencies = habilidadDependencies) {
  const avisar = useAvisos();
  const crearHabilidad = useCallback(
    (signal, request) => dependencies.crearHabilidad(request, { signal }),
    [dependencies],
  );
  const { cargando, error, ejecutar } = useAsync(crearHabilidad, { inmediato: false });

  const crear = useCallback(
    async (request) => {
      const creada = await ejecutar(request);
      if (creada) avisar.exito("Habilidad creada correctamente.");
      return creada;
    },
    [ejecutar, avisar],
  );

  return { guardando: cargando, error, crear };
}
