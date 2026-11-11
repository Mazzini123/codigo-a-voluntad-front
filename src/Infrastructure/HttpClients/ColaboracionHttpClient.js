import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearColaboracionHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async desvincular(proyectoId, colaboracionId, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/desvinculacion`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
    async retirar(proyectoId, colaboracionId, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/retiro`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
    async registrar(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/colaboraciones`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async listarPorProyecto(proyectoId, { signal, page = 1, limit = 20, estado } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/colaboraciones`, {
        signal,
        params: { page, limit, ...(estado ? { estado } : {}) },
        requiereSesion: true,
      });
    },
    async listarPendientesDeColectivo(
      colectivoId,
      { signal, page = 1, limit = 20 } = {},
    ) {
      return api.get(ruta`/colectivos/${colectivoId}/postulaciones`, {
        signal,
        params: { page, limit },
        requiereSesion: true,
      });
    },
    async listarPorColaborador(colaboradorId, { signal, requiereSesion = false } = {}) {
      return api.get(ruta`/colaboradores/${colaboradorId}/colaboraciones`, {
        signal,
        requiereSesion,
      });
    },
    async aceptar(proyectoId, colaboracionId, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/aceptacion`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
    async rechazar(proyectoId, colaboracionId, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/rechazo`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
    async finalizar(proyectoId, colaboracionId, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/finalizacion`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
  };
}
