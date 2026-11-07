import { useCallback, useEffect, useRef, useState } from "react";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { useAvisos } from "./useAvisos.js";

export const AVISO_PUBLICADO = "Publicaste el proyecto.";
const SIN_PEDIDO = Object.freeze({ publicando: false, error: null, proyecto: null });

export function useCrearProyecto(colectivoId, dependencies = proyectoDependencies) {
  const avisar = useAvisos();
  const [estado, setEstado] = useState(SIN_PEDIDO);
  const pedidoActual = useRef(null);

  useEffect(() => () => pedidoActual.current?.abort(), []);

  const publicar = useCallback(
    async (request) => {
      pedidoActual.current?.abort();
      const pedido = new AbortController();
      pedidoActual.current = pedido;
      setEstado({ publicando: true, error: null, proyecto: null });
      try {
        const proyecto = await dependencies.crearProyecto(colectivoId, request, {
          signal: pedido.signal,
        });
        if (pedido.signal.aborted) return false;
        avisar.exito(AVISO_PUBLICADO);
        setEstado({ publicando: false, error: null, proyecto });
        return true;
      } catch (error) {
        if (pedido.signal.aborted) return false;
        setEstado({ publicando: false, error, proyecto: null });
        return false;
      }
    },
    [colectivoId, dependencies, avisar],
  );

  const reiniciar = useCallback(() => setEstado(SIN_PEDIDO), []);

  return { ...estado, publicar, reiniciar };
}
