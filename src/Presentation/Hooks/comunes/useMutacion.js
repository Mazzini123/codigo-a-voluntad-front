import { useCallback, useEffect, useRef, useState } from "react";

const SIN_PEDIDO = Object.freeze({ enviando: false, error: null, datos: null });
const IGNORADA = Object.freeze({ ok: false, ignorada: true, datos: null, error: null });

function conMensajePropio(error, mensajes) {
  if (error?.esDeSesion) return error;
  const mensaje = mensajes?.[error?.status];
  return mensaje && typeof error.conMensaje === "function"
    ? error.conMensaje(mensaje)
    : error;
}

export function useMutacion(tarea, { mensajes } = {}) {
  const [estado, setEstado] = useState(SIN_PEDIDO);
  const pedidoActual = useRef(null);

  useEffect(() => () => pedidoActual.current?.abort(), []);

  const ejecutar = useCallback(
    async (...argumentos) => {
      if (pedidoActual.current) return IGNORADA;
      const pedido = new AbortController();
      pedidoActual.current = pedido;
      setEstado({ enviando: true, error: null, datos: null });
      try {
        const datos = await tarea(pedido.signal, ...argumentos);
        if (pedido.signal.aborted) return IGNORADA;
        setEstado({ enviando: false, error: null, datos });
        return { ok: true, ignorada: false, datos, error: null };
      } catch (falla) {
        if (pedido.signal.aborted) return IGNORADA;
        const error = conMensajePropio(falla, mensajes);
        setEstado({ enviando: false, error, datos: null });
        return { ok: false, ignorada: false, datos: null, error };
      } finally {
        pedidoActual.current = null;
      }
    },
    [tarea, mensajes],
  );

  const reiniciar = useCallback(() => setEstado(SIN_PEDIDO), []);

  return { ...estado, ejecutar, reiniciar };
}
