import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearLogroHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(proyectoId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/logros`, { signal });
    },
    async obtenerPorId(proyectoId, logroId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/logros/${logroId}`, { signal });
    },
    async crear(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/logros`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async actualizar(proyectoId, logroId, request, { signal } = {}) {
      return api.put(ruta`/proyectos/${proyectoId}/logros/${logroId}`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async eliminar(proyectoId, logroId, { signal } = {}) {
      await http.delete(ruta`/proyectos/${proyectoId}/logros/${logroId}`, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
