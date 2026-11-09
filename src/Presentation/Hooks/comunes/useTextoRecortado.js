import { useLayoutEffect, useState } from "react";

export function useTextoRecortado(ref, texto) {
  const [recortado, setRecortado] = useState(false);

  useLayoutEffect(() => {
    const elemento = ref.current;
    if (!elemento) return undefined;
    const medir = () => setRecortado(elemento.scrollHeight > elemento.clientHeight + 1);
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [ref, texto]);

  return recortado;
}
