import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearAdministracionHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listarProyectos(query = {}, { signal } = {}) {
      return api.get("/administracion/proyectos", {
        params: query,
        signal,
        requiereSesion: true,
      });
    },
    async listarDestacados({ signal } = {}) {
      return api.get("/administracion/proyectos/destacados", {
        signal,
        requiereSesion: true,
      });
    },
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
    async publicarTerminos(request, { signal } = {}) {
      return api.put("/administracion/terminos", request, {
        signal,
        requiereSesion: true,
      });
    },
    async darDeBajaProyecto(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/administracion/proyectos/${proyectoId}/baja`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async darDeBajaColectivo(colectivoId, request, { signal } = {}) {
      return api.post(ruta`/administracion/colectivos/${colectivoId}/baja`, request, {
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
