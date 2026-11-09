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
    async registrar(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/colaboraciones`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async listarPorProyecto(proyectoId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/colaboraciones`, {
        signal,
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
