import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearAvanceHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(proyectoId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/avances`, { signal });
    },
    async obtenerPorId(proyectoId, avanceId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/avances/${avanceId}`, { signal });
    },
    async registrar(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/avances`, request, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
