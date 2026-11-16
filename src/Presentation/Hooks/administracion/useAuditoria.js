import { useCallback } from "react";
import { administracionDependencies } from "@/Presentation/Dependencies/administracionDependencies.js";
import { desdeDelDia } from "@/Presentation/Formatos/auditoria.js";
import { finDelDia } from "@/Presentation/Formularios/proyecto/formularioProyecto.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

export const ACCIONES_POR_PAGINA = 20;

export function claveDeAuditoria(filtros, pagina) {
  return `${JSON.stringify(filtros)}|${pagina}`;
}

export function useAuditoria(
  { filtros, pagina },
  dependencias = administracionDependencies,
) {
  const { accion, entidadTipo, entidadId, desde, hasta } = filtros;
  const clave = claveDeAuditoria(filtros, pagina);
  const obtener = useCallback(
    async (signal) => {
      const resultado = await dependencias.listarAuditoria(
        {
          page: pagina,
          limit: ACCIONES_POR_PAGINA,
          ...(accion && { accion }),
          ...(entidadTipo && { entidadTipo }),
          ...(entidadId && { entidadId }),
          ...(desde && { desde: desdeDelDia(desde) }),
          ...(hasta && { hasta: finDelDia(hasta) }),
        },
        { signal },
      );
      return { ...resultado, consulta: clave };
    },
    [dependencias, clave, pagina, accion, entidadTipo, entidadId, desde, hasta],
  );
  const consulta = useConsulta(obtener);
  return {
    resultado: consulta.datos,
    error: consulta.error,
    cargando: consulta.cargando,
    reintentar: consulta.reintentar,
  };
}
