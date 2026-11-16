import { useCallback, useRef, useState } from "react";
import {
  aceptacionPendiente,
  conTerminosAceptados,
} from "@/Application/Domain/Reglas/terminos.js";
import { ACEPTACION_REQUERIDA } from "@/Presentation/Formatos/terminos.js";

export function useAceptacionDeTerminos(estado) {
  const { terminos } = estado;
  const [versionAceptada, setVersionAceptada] = useState(null);
  const [error, setError] = useState(null);
  const refCasilla = useRef(null);
  const aceptada = Boolean(terminos) && versionAceptada === terminos.version;

  const alCambiar = useCallback(
    (marcada) => {
      setVersionAceptada(marcada ? (terminos?.version ?? null) : null);
      setError(null);
    },
    [terminos],
  );

  const validar = useCallback(() => {
    if (!aceptacionPendiente(terminos, versionAceptada)) return true;
    setError(ACEPTACION_REQUERIDA);
    refCasilla.current?.focus();
    return false;
  }, [terminos, versionAceptada]);

  const conAceptacion = useCallback(
    (pedido) => conTerminosAceptados(pedido, terminos),
    [terminos],
  );

  return { estado, aceptada, error, refCasilla, alCambiar, validar, conAceptacion };
}
