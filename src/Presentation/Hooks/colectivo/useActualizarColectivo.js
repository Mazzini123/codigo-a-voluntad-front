import { useCallback, useState } from "react";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useActualizarColectivo(
  colectivoId,
  dependencies = colectivoDependencies,
) {
  const avisar = useAvisos();
  const [version, setVersion] = useState(0);
  const actualizarColectivo = useCallback(
    (signal, request) =>
      dependencies.actualizarColectivo(colectivoId, request, { signal }),
    [colectivoId, dependencies],
  );
  const { datos, enviando, error, ejecutar } = useMutacion(actualizarColectivo);

  const guardar = useCallback(
    async (request) => {
      const { ok } = await ejecutar(request);
      if (!ok) return false;
      setVersion((anterior) => anterior + 1);
      avisar.exito("Cambios guardados.");
      return true;
    },
    [ejecutar, avisar],
  );

  return { guardar, guardando: enviando, error, guardado: datos, version };
}
