import { useCallback, useState } from "react";
import { colaboradorDependencies } from "../Dependencies/colaboradorDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAvisos } from "./useAvisos.js";

export function useActualizarColaboradora(
  colaboradoraId,
  alGuardar,
  dependencies = colaboradorDependencies,
) {
  const avisar = useAvisos();
  const [version, setVersion] = useState(0);
  const actualizar = useCallback(
    async (signal, request) => {
      const colaboradora = await dependencies.actualizarColaborador(
        colaboradoraId,
        request,
        {
          signal,
        },
      );
      alGuardar(colaboradora);
      setVersion((anterior) => anterior + 1);
      avisar.exito("Cambios guardados.");
      return colaboradora;
    },
    [colaboradoraId, alGuardar, dependencies, avisar],
  );
  const { cargando, error, ejecutar } = useAsync(actualizar, { inmediato: false });
  return { guardar: ejecutar, guardando: cargando, error, version };
}
