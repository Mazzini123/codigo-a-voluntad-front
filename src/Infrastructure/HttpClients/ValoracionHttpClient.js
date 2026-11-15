import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearValoracionHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async valorar(proyectoId, colaboracionId, request, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/colaboraciones/${colaboracionId}/valoraciones`,
        request,
        { signal, requiereSesion: true },
      );
    },
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/valoraciones`, { signal });
    },
    async obtenerDeColaborador(colaboradorId, { signal } = {}) {
      return api.get(ruta`/colaboradores/${colaboradorId}/valoraciones`, { signal });
    },
  };
}
