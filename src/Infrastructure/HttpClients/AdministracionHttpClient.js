import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearAdministracionHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async destacar(proyectoId, request, { signal } = {}) {
      return api.put(ruta`/administracion/proyectos/${proyectoId}/destacado`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async listarRevisiones(query = {}, { signal } = {}) {
      return api.get("/administracion/revisiones", {
        params: query,
        signal,
        requiereSesion: true,
      });
    },
    async resolverRevision(revisionId, request, { signal } = {}) {
      return api.post(
        ruta`/administracion/revisiones/${revisionId}/resolucion`,
        request,
        {
          signal,
          requiereSesion: true,
        },
      );
    },
    async listarAuditoria(query = {}, { signal } = {}) {
      return api.get("/administracion/auditoria", {
        params: query,
        signal,
        requiereSesion: true,
      });
    },
    async quitar(proyectoId, { signal } = {}) {
      return api.delete(ruta`/administracion/proyectos/${proyectoId}/destacado`, {
        signal,
        requiereSesion: true,
      });
    },
  };
}
