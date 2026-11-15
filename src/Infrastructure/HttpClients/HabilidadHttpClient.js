import { crearPedidos } from "@/Infrastructure/Http/pedidos.js";

export function crearHabilidadHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(query = {}, { signal } = {}) {
      return api.get("/habilidades", { params: query, signal });
    },
    async crear(request, { signal } = {}) {
      return api.post("/habilidades", request, { signal });
    },
  };
}
