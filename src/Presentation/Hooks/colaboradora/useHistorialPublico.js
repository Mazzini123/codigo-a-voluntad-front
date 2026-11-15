import { useCallback } from "react";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

const DEPENDENCIAS = Object.freeze({
  colaboraciones: colaboracionDependencies,
  proyectos: proyectoDependencies,
});

const ESTADOS_DEL_HISTORIAL = new Set([
  COLABORACION_ESTADO.ACEPTADA,
  COLABORACION_ESTADO.FINALIZADA,
  COLABORACION_ESTADO.DESVINCULADA,
]);

function esPublicaYDelHistorial({ colaboracion }) {
  return (
    colaboracion.esPublica === true && ESTADOS_DEL_HISTORIAL.has(colaboracion.estado)
  );
}

export function useHistorialPublico(colaboradoraId, dependencias = DEPENDENCIAS) {
  const consultar = useCallback(
    async (signal) => {
      const registros =
        await dependencias.colaboraciones.listarColaboracionesDeColaborador(
          colaboradoraId,
          { signal },
        );
      const publicas = registros.filter(esPublicaYDelHistorial);
      const ids = [...new Set(publicas.map(({ proyectoId }) => proyectoId))];
      const resultados = await Promise.allSettled(
        ids.map((id) => dependencias.proyectos.obtenerProyecto(id, { signal })),
      );
      const proyectos = new Map(
        ids.map((id, indice) => {
          const resultado = resultados[indice];
          return [id, resultado.status === "fulfilled" ? resultado.value : null];
        }),
      );
      return publicas.map(({ proyectoId, colaboracion }) => ({
        colaboracion,
        proyecto: proyectos.get(proyectoId),
      }));
    },
    [colaboradoraId, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(consultar);
  return { historial: datos, error, cargando, reintentar };
}
