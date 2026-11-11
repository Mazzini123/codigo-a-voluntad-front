import { useCallback, useState } from "react";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { usePagina, normalizarPagina } from "@/Presentation/Hooks/comunes/usePagina.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
const operaciones = {
  aceptar: colaboracionDependencies.aceptarPostulacion,
  rechazar: colaboracionDependencies.rechazarPostulacion,
  desvincular: colaboracionDependencies.desvincularColaboracion,
};
export function usePostulacionesRecibidas(id, estado = "") {
  const obtener = useCallback(
    async (query, signal) => {
      const [proyecto, datos] = await Promise.all([
        proyectoDependencies.obtenerProyecto(id, { signal }),
        colaboracionDependencies.listarColaboracionesDeProyecto(id, {
          ...query,
          signal,
          estado,
        }),
      ]);
      return { ...normalizarPagina(datos), proyecto };
    },
    [id, estado],
  );
  const consulta = usePagina(obtener);
  const operar = useCallback(
    (_signal, accion, colaboracionId) => operaciones[accion](id, colaboracionId),
    [id],
  );
  const mutacion = useMutacion(operar);
  const [actualizando, setActualizando] = useState(false);
  async function resolver(accion, colaboracionId) {
    const { ignorada, error } = await mutacion.ejecutar(accion, colaboracionId);
    if (ignorada) return null;
    setActualizando(true);
    const actualizado = await consulta.reintentar();
    setActualizando(false);
    return { fallo: error, actualizado };
  }
  return {
    ...consulta,
    datos: consulta.datos ? [consulta.datos.proyecto, consulta.items] : null,
    resolver,
    procesando: mutacion.enviando || actualizando,
  };
}
