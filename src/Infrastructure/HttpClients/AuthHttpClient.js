import { crearPedidos } from "@/Infrastructure/Http/pedidos.js";

export function crearAuthHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerCuentaActual({ signal } = {}) {
      return api.get("/auth/me", { signal, requiereSesion: true });
    },
    async registrarUsuario({ signal } = {}) {
      return api.post("/auth/registro", undefined, { signal, requiereSesion: true });
    },
    async cambiarNombre(request, { signal } = {}) {
      return api.put("/auth/usuario", request, { signal, requiereSesion: true });
    },
    async seleccionarContexto(request, { signal } = {}) {
      return api.put("/auth/contexto-actual", request, { signal, requiereSesion: true });
    },
    async limpiarContexto({ signal, timeout } = {}) {
      return api.delete("/auth/contexto-actual", {
        signal,
        timeout,
        requiereSesion: true,
      });
    },
  };
}
