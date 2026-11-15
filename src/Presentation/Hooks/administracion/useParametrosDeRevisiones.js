import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function useParametrosDeRevisiones() {
  const [parametros, setParametros] = useSearchParams();
  const pedido = parametros.get("estado");
  const estado = Object.values(ESTADO_REVISION).includes(pedido)
    ? pedido
    : ESTADO_REVISION.PENDIENTE;
  const pagina = leerPagina(parametros.get("pagina"));

  const cambiarEstado = useCallback(
    (nuevo) => {
      setParametros(nuevo === ESTADO_REVISION.PENDIENTE ? {} : { estado: nuevo });
    },
    [setParametros],
  );

  const irAPagina = useCallback(
    (numero, { reemplazar = false } = {}) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          if (numero > 1) nuevos.set("pagina", String(numero));
          else nuevos.delete("pagina");
          return nuevos;
        },
        { replace: reemplazar },
      );
    },
    [setParametros],
  );

  return { estado, pagina, cambiarEstado, irAPagina };
}
