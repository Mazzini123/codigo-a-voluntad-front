import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

function paginaDe(texto) {
  const numero = Number.parseInt(texto ?? "1", 10);
  return Number.isInteger(numero) && numero > 0 ? numero : 1;
}

export function useBusquedaParaDestacar() {
  const [parametros, setParametros] = useSearchParams();
  const etiqueta = parametros.get("etiqueta")?.trim() ?? "";
  const pagina = paginaDe(parametros.get("pagina"));

  const buscar = useCallback(
    (texto) => {
      const limpio = texto.trim();
      setParametros(limpio ? { etiqueta: limpio } : {});
    },
    [setParametros],
  );

  const irAPagina = useCallback(
    (numero, { reemplazar = false } = {}) => {
      setParametros(
        (previos) => {
          const siguientes = new URLSearchParams(previos);
          if (numero > 1) siguientes.set("pagina", String(numero));
          else siguientes.delete("pagina");
          return siguientes;
        },
        { replace: reemplazar },
      );
    },
    [setParametros],
  );

  return { etiqueta, pagina, buscar, irAPagina };
}
