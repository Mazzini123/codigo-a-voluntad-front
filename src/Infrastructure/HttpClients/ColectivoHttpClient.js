import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearColectivoHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listarMediosDeContacto(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/medios-de-contacto`, {
        signal,
        requiereSesion: true,
      });
    },
    async agregarMedioDeContacto(colectivoId, request, { signal } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/medios-de-contacto`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async quitarMedioDeContacto(colectivoId, tipo, valor, { signal } = {}) {
      return api.delete(
        ruta`/colectivos/${colectivoId}/medios-de-contacto/${tipo}/${valor}`,
        { signal, requiereSesion: true },
      );
    },
    async listar(query = {}, { signal } = {}) {
      return api.get("/colectivos", { params: query, signal });
    },
    async obtenerPorId(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}`, {
        signal,
      });
    },
    async crear(request, { signal } = {}) {
      return api.post("/colectivos", request, {
        signal,
        requiereSesion: true,
      });
    },
    async actualizar(colectivoId, request, { signal } = {}) {
      return api.put(ruta`/colectivos/${colectivoId}`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async darDeBaja(colectivoId, { signal } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/baja`, undefined, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
