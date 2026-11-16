import { crearPedidos } from "@/Infrastructure/Http/pedidos.js";

export function crearTerminosHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerVigentes({ signal } = {}) {
      return api.get("/terminos", { signal });
    },
  };
}
