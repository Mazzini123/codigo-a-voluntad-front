import { useCallback, useEffect } from "react";
import { useBlocker } from "react-router-dom";

export function useAvisoCambiosSinGuardar(hayCambios) {
  const bloquear = useCallback(
    ({ currentLocation, nextLocation }) =>
      hayCambios && currentLocation.pathname !== nextLocation.pathname,
    [hayCambios],
  );
  const bloqueo = useBlocker(bloquear);

  useEffect(() => {
    if (!hayCambios) return undefined;
    function avisarAlSalir(evento) {
      evento.preventDefault();
      evento.returnValue = "";
    }
    window.addEventListener("beforeunload", avisarAlSalir);
    return () => window.removeEventListener("beforeunload", avisarAlSalir);
  }, [hayCambios]);

  return {
    preguntando: bloqueo.state === "blocked",
    salir: () => bloqueo.proceed?.(),
    quedarse: () => bloqueo.reset?.(),
  };
}
