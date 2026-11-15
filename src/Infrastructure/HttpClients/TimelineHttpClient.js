import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearTimelineHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/timeline`, { signal });
    },
  };
}
