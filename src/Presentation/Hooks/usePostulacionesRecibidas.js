import { useCallback, useRef, useState } from "react";
import { colaboracionDependencies } from "../Dependencies/colaboracionDependencies.js";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { useAsync } from "./useAsync.js";

const operaciones = {
  aceptar: colaboracionDependencies.aceptarPostulacion,
  rechazar: colaboracionDependencies.rechazarPostulacion,
  desvincular: colaboracionDependencies.desvincularColaboracion,
};

export function usePostulacionesRecibidas(id) {
  const obtener = useCallback(
    (signal) =>
      Promise.all([
        proyectoDependencies.obtenerProyecto(id, { signal }),
        colaboracionDependencies.listarColaboracionesDeProyecto(id, { signal }),
      ]),
    [id],
  );
  const consulta = useAsync(obtener);
  const [procesando, setProcesando] = useState(false);
  const enCurso = useRef(false);

  async function resolver(accion, colaboracionId) {
    if (enCurso.current) return null;
    enCurso.current = true;
    setProcesando(true);
    let fallo = null;
    try {
      await operaciones[accion](id, colaboracionId);
    } catch (error) {
      fallo = error;
    }
    const actualizado = await consulta.reintentar();
    enCurso.current = false;
    setProcesando(false);
    return { fallo, actualizado };
  }

  return { ...consulta, resolver, procesando };
}
