import { crearPedidos } from "@/Infrastructure/Http/pedidos.js";

export function crearCatalogoHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listarProvincias({ signal } = {}) {
      return api.get("/catalogos/provincias", { signal });
    },
  };
}
