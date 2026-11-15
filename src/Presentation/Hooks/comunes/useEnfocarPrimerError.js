import { useEffect } from "react";

const CAMPO_CON_ERROR = '[aria-invalid="true"]';

export function useEnfocarPrimerError(refFormulario, intento, errorDelServidor = null) {
  useEffect(() => {
    if (!intento && !errorDelServidor) return;
    refFormulario.current?.querySelector(CAMPO_CON_ERROR)?.focus();
  }, [refFormulario, intento, errorDelServidor]);
}
