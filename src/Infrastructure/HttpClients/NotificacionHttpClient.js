import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearNotificacionHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(colaboradorId, query = {}, { signal } = {}) {
      return api.get(ruta`/colaboradores/${colaboradorId}/notificaciones`, {
        params: query,
        signal,
        requiereSesion: true,
      });
    },
    async marcarComoLeida(colaboradorId, notificacionId, { signal } = {}) {
      return api.post(
        ruta`/colaboradores/${colaboradorId}/notificaciones/${notificacionId}/lectura`,
        undefined,
        { signal, requiereSesion: true },
      );
    },
  };
}
