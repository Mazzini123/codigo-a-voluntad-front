import { crearPedidos } from "@/Infrastructure/Http/pedidos.js";

export function crearAuthHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerCuentaActual({ signal } = {}) {
      return api.get("/auth/me", { signal, requiereSesion: true });
    },
  };
}
