import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { MOTIVO_REVISION } from "@/Application/Domain/Enums/MOTIVO_REVISION.js";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

function leerEstado(valor) {
  return Object.values(ESTADO_REVISION).includes(valor)
    ? valor
    : ESTADO_REVISION.PENDIENTE;
}

function leerMotivo(valor) {
  return Object.values(MOTIVO_REVISION).includes(valor) ? valor : "";
}

function filtrosEnLaUrl({ motivo, estado }) {
  const nuevos = new URLSearchParams();
  if (motivo) nuevos.set("motivo", motivo);
  if (estado !== ESTADO_REVISION.PENDIENTE) nuevos.set("estado", estado);
  return nuevos;
}

export function useParametrosDeRevisiones() {
  const [parametros, setParametros] = useSearchParams();
  const estado = leerEstado(parametros.get("estado"));
  const motivo = leerMotivo(parametros.get("motivo"));
  const pagina = leerPagina(parametros.get("pagina"));

  const cambiarEstado = useCallback(
    (nuevo) => setParametros(filtrosEnLaUrl({ motivo, estado: nuevo })),
    [setParametros, motivo],
  );

  const cambiarMotivo = useCallback(
    (nuevo) => setParametros(filtrosEnLaUrl({ motivo: nuevo, estado })),
    [setParametros, estado],
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

  return { estado, motivo, pagina, cambiarEstado, cambiarMotivo, irAPagina };
}
