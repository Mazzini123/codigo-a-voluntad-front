import { useCallback, useState } from "react";
import { TIPO_DE_BAJA } from "@/Presentation/Formatos/baja.js";
import { administracionDependencies } from "@/Presentation/Dependencies/administracionDependencies.js";
import { colectivoDependencies } from "@/Presentation/Dependencies/colectivoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const CANDIDATOS_POR_PAGINA = 12;

const DEPENDENCIAS = Object.freeze({
  colectivos: colectivoDependencies,
  administracion: administracionDependencies,
});

export function claveDeBajas({ tipo, estado, busqueda, pagina }) {
  return `${tipo}|${estado}|${busqueda}|${pagina}`;
}

function listar(dependencias, { tipo, estado, busqueda, pagina }, signal) {
  const query = {
    page: pagina,
    limit: CANDIDATOS_POR_PAGINA,
    ...(busqueda && { q: busqueda }),
  };
  if (tipo === TIPO_DE_BAJA.COLECTIVO) {
    return dependencias.colectivos.listarColectivos(query, { signal });
  }
  return dependencias.administracion.listarProyectosParaBaja(
    estado ? { ...query, estado } : query,
    { signal },
  );
}

function darDeBaja(dependencias, tipo, id, motivo) {
  return tipo === TIPO_DE_BAJA.COLECTIVO
    ? dependencias.administracion.darDeBajaColectivo(id, motivo)
    : dependencias.administracion.darDeBajaProyecto(id, motivo);
}

export function useBajasPorInfraccion(
  { tipo, estado, busqueda, pagina },
  dependencias = DEPENDENCIAS,
) {
  const consultar = useCallback(
    async (signal) => {
      const filtros = { tipo, estado, busqueda, pagina };
      const resultado = await listar(dependencias, filtros, signal);
      return { ...resultado, consulta: claveDeBajas(filtros) };
    },
    [dependencias, tipo, estado, busqueda, pagina],
  );
  const candidatos = useConsulta(consultar);
  const tarea = useCallback(
    (_signal, tipoDeBaja, id, motivo) => darDeBaja(dependencias, tipoDeBaja, id, motivo),
    [dependencias],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);
  const { reintentar: recargar } = candidatos;

  const operar = useCallback(
    async (tipoDeBaja, id, motivo) => {
      const resultado = await mutacion.ejecutar(tipoDeBaja, id, motivo);
      if (resultado.ignorada) return null;
      setActualizando(true);
      await recargar();
      setActualizando(false);
      return resultado;
    },
    [mutacion, recargar],
  );

  return {
    resultado: candidatos.datos,
    error: candidatos.error,
    cargando: candidatos.cargando,
    reintentar: candidatos.reintentar,
    operar,
    procesando: mutacion.enviando || actualizando,
  };
}
