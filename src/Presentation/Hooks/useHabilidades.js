import { useEffect, useReducer, useState } from "react";
import { habilidadDependencies } from "../Dependencies/habilidadDependencies.js";
import { obtenerMensajeError } from "./obtenerMensajeError.js";

export function useHabilidades(page, dependencies = habilidadDependencies) {
  const [estado, setEstado] = useState({ pagina: null, cargando: true, error: "" });
  const [version, recargar] = useReducer((valor) => valor + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    dependencies
      .listarHabilidades({ page, limit: 10 }, { signal: controller.signal })
      .then((pagina) => {
        if (!controller.signal.aborted) setEstado({ pagina, cargando: false, error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setEstado({ pagina: null, cargando: false, error: obtenerMensajeError(error) });
      });
    return () => controller.abort();
  }, [page, version, dependencies]);

  function refrescar() {
    setEstado({ pagina: null, cargando: true, error: "" });
    recargar();
  }
  return { ...estado, refrescar };
}
