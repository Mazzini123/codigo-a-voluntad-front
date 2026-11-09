import { useCallback, useEffect, useReducer, useRef } from "react";
import { usePostularse } from "./usePostularse.js";

export function crearEstadoDePostulacion() {
  return {
    aPostular: null,
    confirmadas: new Map(),
    consultasPendientes: [],
    actualizando: false,
  };
}

export function postulacionEnDetalle(estado, accion) {
  switch (accion.tipo) {
    case "abrir":
      return { ...estado, aPostular: { perfil: accion.perfil, esPublica: true } };
    case "cambiarVisibilidad":
      if (!estado.aPostular) return estado;
      return {
        ...estado,
        aPostular: { ...estado.aPostular, esPublica: accion.esPublica },
      };
    case "cerrar":
      return { ...estado, aPostular: null };
    case "registrada":
      return {
        ...estado,
        aPostular: null,
        confirmadas: new Map(estado.confirmadas).set(
          accion.perfilId,
          accion.colaboracion,
        ),
      };
    case "actualizacionIniciada":
      return { ...estado, actualizando: true };
    case "actualizacionTerminada":
      return { ...estado, actualizando: false, consultasPendientes: accion.pendientes };
    case "sincronizadas": {
      const restantes = new Map(estado.confirmadas);
      for (const perfilId of accion.perfilIds) restantes.delete(perfilId);
      if (restantes.size === estado.confirmadas.size) return estado;
      return { ...estado, confirmadas: restantes };
    }
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function usePostulacionEnDetalle({
  proyecto,
  colaboradoraId,
  postulaciones,
  recargarProyecto,
  buscarDestinoDeFoco,
}) {
  const [estado, despachar] = useReducer(
    postulacionEnDetalle,
    undefined,
    crearEstadoDePostulacion,
  );
  const actualizacionEnCurso = useRef(false);
  const focoPostulacion = useRef(null);
  const { postularse, enviando, error, reiniciar } = usePostularse(
    proyecto.id,
    colaboradoraId,
  );

  const sincronizadas = postulaciones.postulaciones
    .filter(({ id, perfil }) => estado.confirmadas.get(perfil)?.id === id)
    .map(({ perfil }) => perfil);
  if (sincronizadas.length)
    despachar({ tipo: "sincronizadas", perfilIds: sincronizadas });

  function postulacionDe(perfilId) {
    return (
      postulaciones.postulaciones.find((candidata) => candidata.perfil === perfilId) ??
      estado.confirmadas.get(perfilId)
    );
  }

  function abrirDialogo(perfil) {
    reiniciar();
    focoPostulacion.current = null;
    despachar({ tipo: "abrir", perfil });
  }

  function cerrarDialogo() {
    reiniciar();
    despachar({ tipo: "cerrar" });
  }

  function cambiarVisibilidad(esPublica) {
    despachar({ tipo: "cambiarVisibilidad", esPublica });
  }

  async function actualizarEstado(consultas) {
    if (actualizacionEnCurso.current) return;
    actualizacionEnCurso.current = true;
    despachar({ tipo: "actualizacionIniciada" });
    const recargar = {
      proyecto: recargarProyecto,
      postulaciones: postulaciones.recargar,
    };
    const resultados = await Promise.allSettled(
      consultas.map((consulta) => recargar[consulta]()),
    );
    const pendientes = consultas.filter((_, indice) => {
      const resultado = resultados[indice];
      return resultado.status !== "fulfilled" || !resultado.value;
    });
    actualizacionEnCurso.current = false;
    despachar({ tipo: "actualizacionTerminada", pendientes });
  }

  async function enviar() {
    const { perfil, esPublica } = estado.aPostular;
    const registrada = await postularse(perfil, esPublica);
    if (!registrada) return;
    focoPostulacion.current = { perfilId: perfil.id, destino: null };
    despachar({ tipo: "registrada", perfilId: perfil.id, colaboracion: registrada });
    await actualizarEstado(["proyecto", "postulaciones"]);
  }

  const destinoDeFoco = useCallback(() => {
    const foco = focoPostulacion.current;
    if (!foco) return null;
    foco.destino = buscarDestinoDeFoco(foco.perfilId);
    return foco.destino;
  }, [buscarDestinoDeFoco]);

  useEffect(() => {
    const foco = focoPostulacion.current;
    if (!foco?.destino || foco.destino.isConnected) return;
    if (document.activeElement === document.body) destinoDeFoco()?.focus();
  }, [proyecto, destinoDeFoco]);

  return {
    aPostular: estado.aPostular,
    consultasPendientes: estado.consultasPendientes,
    actualizando: estado.actualizando,
    enviando,
    error,
    postulacionDe,
    abrirDialogo,
    cerrarDialogo,
    cambiarVisibilidad,
    enviar,
    actualizarEstado,
    destinoDeFoco,
  };
}
