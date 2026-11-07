import { useCallback, useEffect, useRef, useState } from "react";
import { colaboradorDependencies } from "../Dependencies/colaboradorDependencies.js";
import { useAvisos } from "./useAvisos.js";

export function useHabilidadesDeColaboradora(
  colaboradoraId,
  alGuardar,
  dependencies = colaboradorDependencies,
) {
  const avisar = useAvisos();
  const [pendiente, setPendiente] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const pedido = useRef(null);

  useEffect(() => () => pedido.current?.abort(), []);

  const guardar = useCallback(
    async (habilidad, agregar) => {
      const controlador = new AbortController();
      pedido.current = controlador;
      setPendiente(habilidad.codigo);
      setGuardado(false);
      try {
        const colaboradora = agregar
          ? await dependencies.agregarHabilidadAColaborador(
              colaboradoraId,
              { codigoHabilidad: habilidad.codigo },
              { signal: controlador.signal },
            )
          : await dependencies.quitarHabilidadDeColaborador(
              colaboradoraId,
              habilidad.codigo,
              {
                signal: controlador.signal,
              },
            );
        if (controlador.signal.aborted) return;
        alGuardar(colaboradora);
        setGuardado(true);
      } catch (error) {
        if (controlador.signal.aborted) return;
        const accion = agregar ? "agregar" : "quitar";
        avisar.error(
          `No pudimos ${accion} ${habilidad.titulo}. ${error?.mensaje ?? ""}`.trim(),
        );
      } finally {
        if (!controlador.signal.aborted) setPendiente(null);
      }
    },
    [colaboradoraId, alGuardar, dependencies, avisar],
  );

  return {
    pendiente,
    guardado,
    agregar: (habilidad) => guardar(habilidad, true),
    quitar: (habilidad) => guardar(habilidad, false),
  };
}
