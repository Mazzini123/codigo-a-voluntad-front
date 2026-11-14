import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const LARGO_MAXIMO_DE_BUSQUEDA = 80;

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function useParametrosDeColectivos() {
  const [parametros, setParametros] = useSearchParams();
  const busqueda = (parametros.get("q") ?? "").trim().slice(0, LARGO_MAXIMO_DE_BUSQUEDA);
  const pagina = leerPagina(parametros.get("pagina"));

  const [texto, setTexto] = useState(busqueda);
  const [busquedaVista, setBusquedaVista] = useState(busqueda);
  if (busqueda !== busquedaVista) {
    setBusquedaVista(busqueda);
    setTexto(busqueda);
  }

  const aplicar = useCallback(
    (valor) => {
      setParametros(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales);
          const limpia = valor.trim();
          if (limpia) nuevos.set("q", limpia);
          else nuevos.delete("q");
          nuevos.delete("pagina");
          return nuevos;
        },
        { replace: true },
      );
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

  return {
    busqueda,
    pagina,
    clave: `${busqueda}|${pagina}`,
    texto,
    escribir: setTexto,
    buscar: () => aplicar(texto),
    limpiar: () => {
      setTexto("");
      aplicar("");
    },
    irAPagina,
  };
}
