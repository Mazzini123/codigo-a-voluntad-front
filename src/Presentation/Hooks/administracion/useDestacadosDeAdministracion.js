import { useCallback, useState } from "react";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { administracionDependencies } from "@/Presentation/Dependencies/administracionDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const PROYECTOS_PARA_DESTACAR_POR_PAGINA = 12;

const DEPENDENCIAS = Object.freeze({
  proyectos: proyectoDependencies,
  administracion: administracionDependencies,
});

export function claveDeBusqueda(etiqueta, pagina) {
  return `${etiqueta}|${pagina}`;
}

export function useDestacadosDeAdministracion(
  { etiqueta, pagina },
  dependencias = DEPENDENCIAS,
) {
  const consultarVigentes = useCallback(
    (signal) => dependencias.proyectos.listarProyectosDestacados({ signal }),
    [dependencias],
  );
  const vigentes = useConsulta(consultarVigentes);

  const consultarCandidatos = useCallback(
    async (signal) => {
      const resultado = await dependencias.proyectos.listarProyectos(
        {
          page: pagina,
          limit: PROYECTOS_PARA_DESTACAR_POR_PAGINA,
          estado: PROYECTO_ESTADO.ABIERTO,
          ...(etiqueta && { etiqueta }),
        },
        { signal },
      );
      return { ...resultado, consulta: claveDeBusqueda(etiqueta, pagina) };
    },
    [dependencias, etiqueta, pagina],
  );
  const candidatos = useConsulta(consultarCandidatos);

  const tarea = useCallback(
    (_signal, accion, proyectoId, hasta) =>
      accion === "quitar"
        ? dependencias.administracion.quitarDestacado(proyectoId)
        : dependencias.administracion.destacarProyecto(proyectoId, hasta),
    [dependencias],
  );
  const mutacion = useMutacion(tarea);
  const [actualizando, setActualizando] = useState(false);
  const { reintentar: recargarVigentes } = vigentes;
  const { reintentar: recargarCandidatos } = candidatos;

  const operar = useCallback(
    async (accion, proyectoId, hasta) => {
      const resultado = await mutacion.ejecutar(accion, proyectoId, hasta);
      if (resultado.ignorada) return null;
      setActualizando(true);
      await Promise.all([recargarVigentes(), recargarCandidatos()]);
      setActualizando(false);
      return resultado;
    },
    [mutacion, recargarVigentes, recargarCandidatos],
  );

  return {
    vigentes: {
      items: vigentes.datos,
      error: vigentes.error,
      cargando: vigentes.cargando,
      reintentar: vigentes.reintentar,
    },
    candidatos: {
      resultado: candidatos.datos,
      error: candidatos.error,
      cargando: candidatos.cargando,
      reintentar: candidatos.reintentar,
    },
    operar,
    procesando: mutacion.enviando || actualizando,
  };
}
