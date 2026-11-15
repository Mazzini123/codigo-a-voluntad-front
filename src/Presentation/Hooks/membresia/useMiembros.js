import { useCallback, useState } from "react";
import { membresiaDependencies } from "@/Presentation/Dependencies/membresiaDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export function useMiembros(colectivoId, dependencies = membresiaDependencies) {
  const obtener = useCallback(
    (signal) => dependencies.listarMiembros(colectivoId, { signal }),
    [colectivoId, dependencies],
  );
  const consulta = useConsulta(obtener);
  const tarea = useCallback(
    (_signal, accion, contextoId) =>
      accion === "transferir"
        ? dependencies.transferirLiderazgo(colectivoId, contextoId)
        : dependencies.quitarMiembro(colectivoId, contextoId),
    [colectivoId, dependencies],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);

  async function operar(accion, contextoId) {
    const resultado = await mutacion.ejecutar(accion, contextoId);
    if (resultado.ignorada) return null;
    setActualizando(true);
    await consulta.reintentar();
    setActualizando(false);
    return resultado;
  }

  return {
    miembros: consulta.datos,
    error: consulta.error,
    cargando: consulta.cargando,
    reintentar: consulta.reintentar,
    operar,
    procesando: mutacion.enviando || actualizando,
  };
}
