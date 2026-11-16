import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ESTADOS_PARA_BAJA } from "@/Application/Domain/Reglas/baja.js";
import { TIPO_DE_BAJA } from "@/Presentation/Formatos/baja.js";

function leerTipo(valor) {
  return valor === TIPO_DE_BAJA.COLECTIVO
    ? TIPO_DE_BAJA.COLECTIVO
    : TIPO_DE_BAJA.PROYECTO;
}

function leerEstado(tipo, valor) {
  if (tipo !== TIPO_DE_BAJA.PROYECTO) return "";
  return ESTADOS_PARA_BAJA.includes(valor) ? valor : "";
}

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

function enLaUrl({ tipo, estado = "", busqueda = "" }) {
  const nuevos = new URLSearchParams();
  if (tipo !== TIPO_DE_BAJA.PROYECTO) nuevos.set("tipo", tipo);
  if (estado) nuevos.set("estado", estado);
  if (busqueda) nuevos.set("q", busqueda);
  return nuevos;
}

export function useParametrosDeBajas() {
  const [parametros, setParametros] = useSearchParams();
  const tipo = leerTipo(parametros.get("tipo"));
  const estado = leerEstado(tipo, parametros.get("estado"));
  const busqueda = parametros.get("q")?.trim() ?? "";
  const pagina = leerPagina(parametros.get("pagina"));

  const cambiarTipo = useCallback(
    (nuevo) => setParametros(enLaUrl({ tipo: nuevo })),
    [setParametros],
  );

  const cambiarEstado = useCallback(
    (nuevo) => setParametros(enLaUrl({ tipo, estado: nuevo, busqueda })),
    [setParametros, tipo, busqueda],
  );

  const buscar = useCallback(
    (texto) => setParametros(enLaUrl({ tipo, estado, busqueda: texto.trim() })),
    [setParametros, tipo, estado],
  );

  const limpiar = useCallback(
    () => setParametros(enLaUrl({ tipo })),
    [setParametros, tipo],
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
    tipo,
    estado,
    busqueda,
    pagina,
    cambiarTipo,
    cambiarEstado,
    buscar,
    limpiar,
    irAPagina,
  };
}
