import { useCallback, useState } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useSolicitudesDeIngreso(
  colectivoId,
  estado,
  dependencies = membresiaDependencies,
) {
  const obtener = useCallback(
    (signal) =>
      dependencies.listarSolicitudesDeIngreso(colectivoId, estado ? { estado } : {}, {
        signal,
      }),
    [colectivoId, estado, dependencies],
  );
  const consulta = useConsulta(obtener);
  const tarea = useCallback(
    (_signal, accion, solicitudId) =>
      accion === "aceptar"
        ? dependencies.aceptarSolicitudDeIngreso(colectivoId, solicitudId)
        : dependencies.rechazarSolicitudDeIngreso(colectivoId, solicitudId),
    [colectivoId, dependencies],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);

  async function resolver(accion, solicitudId) {
    const resultado = await mutacion.ejecutar(accion, solicitudId);
    if (resultado.ignorada) return null;
    setActualizando(true);
    await consulta.reintentar();
    setActualizando(false);
    return resultado;
  }

  return {
    solicitudes: consulta.datos,
    error: consulta.error,
    cargando: consulta.cargando,
    reintentar: consulta.reintentar,
    resolver,
    procesando: mutacion.enviando || actualizando,
  };
}
