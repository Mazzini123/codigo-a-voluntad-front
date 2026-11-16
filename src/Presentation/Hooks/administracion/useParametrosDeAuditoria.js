import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ACCION_ADMINISTRATIVA } from "@/Application/Domain/Enums/ACCION_ADMINISTRATIVA.js";
import { TIPO_ENTIDAD_AUDITADA } from "@/Application/Domain/Enums/TIPO_ENTIDAD_AUDITADA.js";

export const LARGO_MAXIMO_DE_ID = 64;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

function deLista(valor, enumeracion) {
  return Object.values(enumeracion).includes(valor) ? valor : "";
}

function deFecha(valor) {
  return FECHA.test(valor ?? "") ? valor : "";
}

export function useParametrosDeAuditoria() {
  const [parametros, setParametros] = useSearchParams();
  const filtros = {
    accion: deLista(parametros.get("accion"), ACCION_ADMINISTRATIVA),
    entidadTipo: deLista(parametros.get("entidadTipo"), TIPO_ENTIDAD_AUDITADA),
    entidadId: (parametros.get("entidadId") ?? "").trim().slice(0, LARGO_MAXIMO_DE_ID),
    desde: deFecha(parametros.get("desde")),
    hasta: deFecha(parametros.get("hasta")),
  };
  const pagina = leerPagina(parametros.get("pagina"));

  const aplicar = useCallback(
    (nuevos) => {
      const siguientes = {};
      for (const [clave, valor] of Object.entries(nuevos)) {
        if (valor) siguientes[clave] = valor;
      }
      setParametros(siguientes);
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

  return { filtros, pagina, aplicar, irAPagina };
}
