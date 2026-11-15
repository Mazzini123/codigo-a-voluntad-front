import { useCallback } from "react";
import { habilidadDependencies } from "@/Presentation/Dependencies/habilidadDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({ 409: "Esa habilidad ya existe." });

export function useCrearHabilidad(dependencies = habilidadDependencies) {
  const avisar = useAvisos();
  const crearHabilidad = useCallback(
    (signal, request) => dependencies.crearHabilidad(request, { signal }),
    [dependencies],
  );
  const { enviando, error, ejecutar } = useMutacion(crearHabilidad, {
    mensajes: MENSAJES,
  });

  const crear = useCallback(
    async (request) => {
      const { ok } = await ejecutar(request);
      if (ok) avisar.exito("Habilidad creada correctamente.");
      return ok;
    },
    [ejecutar, avisar],
  );

  return { guardando: enviando, error, crear };
}
