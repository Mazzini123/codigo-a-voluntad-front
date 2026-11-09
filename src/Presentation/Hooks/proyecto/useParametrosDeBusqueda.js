import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const VISTA = Object.freeze({ PARA_VOS: "para-vos", TODOS: "todos" });
const ESPERA_MS = 400;
export const FILTROS = Object.freeze([
  "estado",
  "habilidad",
  "tipoColectivo",
  "ubicacion",
  "modalidad",
]);

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function useParametrosDeBusqueda({ puedeVerParaVos }) {
  const [parametros, setParametros] = useSearchParams();
  const etiqueta = parametros.get("etiqueta")?.trim() ?? "";
  const pagina = leerPagina(parametros.get("pagina"));
  const vistaPedida = parametros.get("vista");
  const filtros = useMemo(
    () =>
      Object.fromEntries(
        FILTROS.map((nombre) => [nombre, parametros.get(nombre)?.trim() ?? ""]),
      ),
    [parametros],
  );
  const hayFiltros = Object.values(filtros).some(Boolean);
  const vista =
    puedeVerParaVos && !etiqueta && !hayFiltros && vistaPedida !== VISTA.TODOS
      ? VISTA.PARA_VOS
      : VISTA.TODOS;

  const [texto, setTexto] = useState(etiqueta);
  const [etiquetaVista, setEtiquetaVista] = useState(etiqueta);
  if (etiqueta !== etiquetaVista) {
    setEtiquetaVista(etiqueta);
    if (texto.trim() !== etiqueta) setTexto(etiqueta);
  }

  const temporizador = useRef(null);

  const aplicarEtiqueta = useCallback(
    (valor) => {
      clearTimeout(temporizador.current);
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          const limpia = valor.trim();
          if (limpia) {
            nuevos.set("etiqueta", limpia);
            if (puedeVerParaVos) nuevos.set("vista", VISTA.TODOS);
          } else nuevos.delete("etiqueta");
          nuevos.delete("pagina");
          return nuevos;
        },
        { replace: true },
      );
    },
    [setParametros, puedeVerParaVos],
  );

  useEffect(() => {
    if (texto.trim() === etiqueta) return undefined;
    temporizador.current = setTimeout(() => aplicarEtiqueta(texto), ESPERA_MS);
    return () => clearTimeout(temporizador.current);
  }, [texto, etiqueta, aplicarEtiqueta]);

  const cambiarFiltro = useCallback(
    (nombre, valor) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          if (valor) {
            nuevos.set(nombre, valor);
            if (puedeVerParaVos) nuevos.set("vista", VISTA.TODOS);
          } else nuevos.delete(nombre);
          nuevos.delete("pagina");
          return nuevos;
        },
        { replace: true },
      );
    },
    [setParametros, puedeVerParaVos],
  );

  const limpiarFiltros = useCallback(() => {
    setParametros(
      (actuales) => {
        const nuevos = new URLSearchParams(actuales);
        FILTROS.forEach((nombre) => nuevos.delete(nombre));
        nuevos.delete("pagina");
        return nuevos;
      },
      { replace: true },
    );
  }, [setParametros]);

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

  const elegirVista = useCallback((nueva) => {
    const nuevos = new URLSearchParams();
    if (nueva === VISTA.TODOS) nuevos.set("vista", VISTA.TODOS);
    return `?${nuevos.toString()}`;
  }, []);

  return {
    etiqueta,
    filtros,
    hayFiltros,
    cambiarFiltro,
    limpiarFiltros,
    clave: `${vista}|${etiqueta}|${JSON.stringify(filtros)}`,
    pagina,
    vista,
    texto,
    escribir: setTexto,
    elegirEtiqueta: (valor) => {
      setTexto(valor);
      aplicarEtiqueta(valor);
    },
    aplicarAhora: () => aplicarEtiqueta(texto),
    limpiar: () => {
      setTexto("");
      aplicarEtiqueta("");
    },
    irAPagina,
    enlaceDeVista: elegirVista,
  };
}
