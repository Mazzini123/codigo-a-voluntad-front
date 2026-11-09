import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearEstadisticaHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerGlobales({ signal } = {}) {
      return api.get("/estadisticas", { signal });
    },
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/estadisticas`, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
