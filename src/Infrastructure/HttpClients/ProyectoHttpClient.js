import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearProyectoHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async obtenerContactoDeColaborador(proyectoId, colaboradorId, { signal } = {}) {
      return api.get(
        ruta`/proyectos/${proyectoId}/colaboradores/${colaboradorId}/contacto`,
        { signal, requiereSesion: true },
      );
    },
    async listar(query = {}, { signal } = {}) {
      return api.get("/proyectos", { params: query, signal });
    },
    async obtenerPorId(proyectoId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}`, {
        signal,
      });
    },
    async crear(colectivoId, request, { signal, claveIdempotencia } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/proyectos`, request, {
        signal,
        requiereSesion: true,
        headers: claveIdempotencia ? { "Idempotency-Key": claveIdempotencia } : undefined,
      });
    },
    async listarPorColectivo(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/proyectos`, {
        signal,
        requiereSesion: true,
      });
    },
    async actualizar(proyectoId, request, { signal } = {}) {
      return api.put(ruta`/proyectos/${proyectoId}`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async finalizar(proyectoId, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/finalizacion`, undefined, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
