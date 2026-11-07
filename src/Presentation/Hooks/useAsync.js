import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync(tarea, { inmediato = true } = {}) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: inmediato });
  const pedidoActual = useRef(null);
  const ultimosArgumentos = useRef([]);

  const cancelar = useCallback(() => pedidoActual.current?.abort(), []);

  const correr = useCallback(
    async (argumentos, conservarError) => {
      cancelar();
      const pedido = new AbortController();
      pedidoActual.current = pedido;
      ultimosArgumentos.current = argumentos;
      setEstado((previo) => ({
        ...previo,
        error: conservarError ? previo.error : null,
        cargando: true,
      }));
      try {
        const datos = await tarea(pedido.signal, ...argumentos);
        if (pedido.signal.aborted) return false;
        setEstado({ datos, error: null, cargando: false });
        return true;
      } catch (error) {
        if (pedido.signal.aborted) return false;
        setEstado((previo) => ({ ...previo, error, cargando: false }));
        return false;
      }
    },
    [tarea, cancelar],
  );

  const ejecutar = useCallback((...argumentos) => correr(argumentos, false), [correr]);

  const reintentar = useCallback(() => correr(ultimosArgumentos.current, true), [correr]);

  useEffect(() => {
    if (inmediato) ejecutar();
    return cancelar;
  }, [ejecutar, inmediato, cancelar]);

  return { ...estado, ejecutar, reintentar };
}
