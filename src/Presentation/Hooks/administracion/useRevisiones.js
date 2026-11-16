import { useCallback, useState } from "react";
import { administracionDependencies } from "@/Presentation/Dependencies/administracionDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const REVISIONES_POR_PAGINA = 20;

export function claveDeRevisiones(estado, pagina, motivo = "") {
  return `${estado}|${motivo}|${pagina}`;
}

export function useRevisiones(
  { estado, pagina, motivo = "" },
  dependencias = administracionDependencies,
) {
  const obtener = useCallback(
    async (signal) => {
      const resultado = await dependencias.listarRevisiones(
        {
          page: pagina,
          limit: REVISIONES_POR_PAGINA,
          estado,
          ...(motivo ? { motivo } : {}),
        },
        { signal },
      );
      return { ...resultado, consulta: claveDeRevisiones(estado, pagina, motivo) };
    },
    [dependencias, estado, pagina, motivo],
  );
  const consulta = useConsulta(obtener);
  const tarea = useCallback(
    (_signal, revisionId, resolucion) =>
      dependencias.resolverRevision(revisionId, resolucion),
    [dependencias],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);
  const { reintentar } = consulta;

  const resolver = useCallback(
    async (revisionId, resolucion) => {
      const resultado = await mutacion.ejecutar(revisionId, resolucion);
      if (resultado.ignorada) return null;
      setActualizando(true);
      await reintentar();
      setActualizando(false);
      return resultado;
    },
    [mutacion, reintentar],
  );

  return {
    resultado: consulta.datos,
    error: consulta.error,
    cargando: consulta.cargando,
    reintentar,
    resolver,
    procesando: mutacion.enviando || actualizando,
  };
}
