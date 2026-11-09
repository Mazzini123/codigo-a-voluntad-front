import { useCallback, useRef, useState } from "react";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { ordenarPorFechaDescendente } from "@/Presentation/Formatos/colaboracion.js";

const DEPENDENCIAS = Object.freeze({
  colaboraciones: colaboracionDependencies,
  proyectos: proyectoDependencies,
});

const MENSAJES_DEL_RETIRO = Object.freeze({
  409: "Esta postulación ya no está pendiente.",
});

const MENSAJES_DE_LA_BAJA = Object.freeze({
  409: "Esta colaboración ya no está activa.",
});

export function useMisPostulaciones(colaboradoraId, dependencias = DEPENDENCIAS) {
  const proyectosCargados = useRef(new Map());
  const [actualizando, setActualizando] = useState(false);

  const consultar = useCallback(
    async (signal) => {
      const registros =
        await dependencias.colaboraciones.listarColaboracionesDeColaborador(
          colaboradoraId,
          { signal, requiereSesion: true },
        );
      const faltantes = [
        ...new Set(
          registros
            .filter(({ proyecto, perfil }) => !proyecto || !perfil)
            .map(({ proyectoId }) => proyectoId),
        ),
      ].filter((id) => !proyectosCargados.current.has(id));
      const resultados = await Promise.allSettled(
        faltantes.map((id) => dependencias.proyectos.obtenerProyecto(id, { signal })),
      );
      resultados.forEach((resultado, indice) => {
        if (resultado.status === "fulfilled")
          proyectosCargados.current.set(faltantes[indice], resultado.value);
      });
      return ordenarPorFechaDescendente(registros).map(
        ({ proyectoId, colaboracion, proyecto, perfil }) => ({
          proyectoId,
          colaboracion,
          proyecto: proyecto ?? proyectosCargados.current.get(proyectoId) ?? null,
          perfil: perfil ?? null,
        }),
      );
    },
    [colaboradoraId, dependencias],
  );
  const consulta = useConsulta(consultar);

  const desvincular = useCallback(
    (_signal, proyectoId, colaboracionId) =>
      dependencias.colaboraciones.desvincularColaboracion(proyectoId, colaboracionId),
    [dependencias],
  );
  const mutacion = useMutacion(desvincular, { mensajes: MENSAJES_DE_LA_BAJA });

  const retirar = useCallback(
    (_signal, proyectoId, colaboracionId) =>
      dependencias.colaboraciones.retirarPostulacion(proyectoId, colaboracionId),
    [dependencias],
  );
  const mutacionDeRetiro = useMutacion(retirar, { mensajes: MENSAJES_DEL_RETIRO });

  async function ejecutarYActualizar(operacion, proyectoId, colaboracionId) {
    const { ignorada, error } = await operacion.ejecutar(proyectoId, colaboracionId);
    if (ignorada) return null;
    setActualizando(true);
    const actualizado = await consulta.reintentar();
    setActualizando(false);
    return { fallo: error, actualizado };
  }

  const darDeBaja = (proyectoId, colaboracionId) =>
    ejecutarYActualizar(mutacion, proyectoId, colaboracionId);
  const retirarPostulacion = (proyectoId, colaboracionId) =>
    ejecutarYActualizar(mutacionDeRetiro, proyectoId, colaboracionId);

  return {
    postulaciones: consulta.datos,
    error: consulta.error,
    reintentar: consulta.reintentar,
    darDeBaja,
    retirarPostulacion,
    procesando: mutacion.enviando || mutacionDeRetiro.enviando || actualizando,
  };
}
