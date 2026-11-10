import { useCallback, useState } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useMisSolicitudesDeIngreso(dependencies = membresiaDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.listarMisSolicitudesDeIngreso({ signal }),
    [dependencies],
  );
  const consulta = useConsulta(obtener);
  const tarea = useCallback(
    (_signal, solicitud) =>
      dependencies.cancelarSolicitudDeIngreso(solicitud.colectivoId, solicitud.id),
    [dependencies],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);

  async function cancelar(solicitud) {
    const resultado = await mutacion.ejecutar(solicitud);
    if (resultado.ignorada) return null;
    setActualizando(true);
    await consulta.reintentar();
    setActualizando(false);
    return resultado;
  }

  return {
    solicitudes: consulta.datos,
    error: consulta.error,
    reintentar: consulta.reintentar,
    cancelar,
    procesando: mutacion.enviando || actualizando,
  };
}
