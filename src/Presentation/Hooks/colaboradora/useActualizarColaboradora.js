import { useCallback, useState } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useActualizarColaboradora(
  colaboradoraId,
  alGuardar,
  dependencies = colaboradorDependencies,
) {
  const avisar = useAvisos();
  const [version, setVersion] = useState(0);
  const actualizar = useCallback(
    (signal, request) =>
      dependencies.actualizarColaborador(colaboradoraId, request, { signal }),
    [colaboradoraId, dependencies],
  );
  const { enviando, error, ejecutar } = useMutacion(actualizar);

  const guardar = useCallback(
    async (request) => {
      const { ok, datos } = await ejecutar(request);
      if (!ok) return false;
      alGuardar(datos);
      setVersion((anterior) => anterior + 1);
      avisar.exito("Cambios guardados.");
      return true;
    },
    [ejecutar, alGuardar, avisar],
  );

  return { guardar, guardando: enviando, error, version };
}
