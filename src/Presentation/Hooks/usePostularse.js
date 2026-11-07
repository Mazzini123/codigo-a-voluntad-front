import { useCallback, useEffect, useRef, useState } from "react";
import { COLABORACION_ESTADO } from "../../Application/Domain/Enums/COLABORACION_ESTADO.js";
import { colaboracionDependencies } from "../Dependencies/colaboracionDependencies.js";
import { useAvisos } from "./useAvisos.js";

export const AVISO_POSTULADA = "Te postulaste. El colectivo va a revisar tu postulación.";
export const AVISO_ACEPTADA = "Listo: ya sos parte de este perfil.";
const SIN_ERROR = Object.freeze({ enviando: false, error: null });

export function usePostularse(
  proyectoId,
  colaboradoraId,
  alRegistrar,
  dependencies = colaboracionDependencies,
) {
  const avisar = useAvisos();
  const [estado, setEstado] = useState(SIN_ERROR);
  const pedidoActual = useRef(null);

  useEffect(() => () => pedidoActual.current?.abort(), []);

  const postularse = useCallback(
    async (perfil, esPublica) => {
      pedidoActual.current?.abort();
      const pedido = new AbortController();
      pedidoActual.current = pedido;
      setEstado({ enviando: true, error: null });
      let colaboracion;
      try {
        colaboracion = await dependencies.registrarColaboracion(
          proyectoId,
          { colaboradorId: colaboradoraId, perfilId: perfil.id, esPublica },
          { signal: pedido.signal },
        );
      } catch (error) {
        if (pedido.signal.aborted) return false;
        setEstado({ enviando: false, error });
        return false;
      }
      if (pedido.signal.aborted) return false;
      avisar.exito(
        colaboracion?.estado === COLABORACION_ESTADO.ACEPTADA
          ? AVISO_ACEPTADA
          : AVISO_POSTULADA,
      );
      await alRegistrar?.();
      if (!pedido.signal.aborted) setEstado(SIN_ERROR);
      return true;
    },
    [proyectoId, colaboradoraId, alRegistrar, dependencies, avisar],
  );

  const reiniciar = useCallback(() => setEstado(SIN_ERROR), []);

  return { postularse, enviando: estado.enviando, error: estado.error, reiniciar };
}
