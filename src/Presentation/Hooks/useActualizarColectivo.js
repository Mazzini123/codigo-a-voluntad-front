import { useCallback, useState } from "react";
import { colectivoDependencies } from "../Dependencies/colectivoDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAvisos } from "./useAvisos.js";

export function useActualizarColectivo(
  colectivoId,
  dependencies = colectivoDependencies,
) {
  const avisar = useAvisos();
  const [version, setVersion] = useState(0);
  const actualizarColectivo = useCallback(
    async (signal, request) => {
      const colectivo = await dependencies.actualizarColectivo(colectivoId, request, {
        signal,
      });
      setVersion((anterior) => anterior + 1);
      avisar.exito("Cambios guardados.");
      return colectivo;
    },
    [colectivoId, dependencies, avisar],
  );
  const { datos, cargando, error, ejecutar } = useAsync(actualizarColectivo, {
    inmediato: false,
  });
  return { guardar: ejecutar, guardando: cargando, error, guardado: datos, version };
}
