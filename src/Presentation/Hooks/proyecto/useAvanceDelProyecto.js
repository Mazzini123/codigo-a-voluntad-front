import { useCallback, useMemo } from "react";
import { avanceDependencies } from "@/Presentation/Dependencies/avanceDependencies.js";
import { logroDependencies } from "@/Presentation/Dependencies/logroDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { ordenarPorFechaDesc } from "@/Presentation/Formatos/avance.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";

const DEPENDENCIAS = Object.freeze({
  proyectos: proyectoDependencies,
  logros: logroDependencies,
  avances: avanceDependencies,
});

const SIN_REGISTROS = Object.freeze([]);

function comoLista(valor) {
  return Array.isArray(valor) ? valor : SIN_REGISTROS;
}

export function useAvanceDelProyecto(proyectoId, dependencias = DEPENDENCIAS) {
  const consultar = useCallback(
    (signal) =>
      Promise.all([
        dependencias.proyectos.obtenerProyecto(proyectoId, { signal }),
        dependencias.logros.listarLogros(proyectoId, { signal }),
        dependencias.avances.listarAvances(proyectoId, { signal }),
      ]),
    [proyectoId, dependencias],
  );
  const { datos, error, cargando, reintentar } = useConsulta(consultar);
  const [proyecto, logros, avances] = datos ?? [null, null, null];
  const logrosOrdenados = useMemo(() => ordenarPorFechaDesc(comoLista(logros)), [logros]);
  const avancesOrdenados = useMemo(
    () => ordenarPorFechaDesc(comoLista(avances)),
    [avances],
  );

  return {
    proyecto,
    logros: logrosOrdenados,
    avances: avancesOrdenados,
    error,
    cargando: cargando && !datos,
    reintentar,
  };
}
