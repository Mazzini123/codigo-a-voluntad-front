/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient}
 */
export function crearProyectoHttpClient(http) {
  return {
    async obtenerContactoDeColaborador(proyectoId, colaboradorId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboradores/${encodeURIComponent(colaboradorId)}/contacto`,
        { signal },
      );
      return response.data;
    },
    async listar(query = {}, { signal } = {}) {
      const response = await http.get("/proyectos", { params: query, signal });
      return response.data;
    },
    async obtenerPorId(proyectoId, { signal } = {}) {
      const response = await http.get(`/proyectos/${encodeURIComponent(proyectoId)}`, {
        signal,
      });
      return response.data;
    },
    async crear(colectivoId, request, { signal } = {}) {
      const response = await http.post(
        `/colectivos/${encodeURIComponent(colectivoId)}/proyectos`,
        request,
        { signal },
      );
      return response.data;
    },
    async listarPorColectivo(colectivoId, { signal } = {}) {
      const response = await http.get(
        `/colectivos/${encodeURIComponent(colectivoId)}/proyectos`,
        { signal },
      );
      return response.data;
    },
    async actualizar(proyectoId, request, { signal } = {}) {
      const response = await http.put(
        `/proyectos/${encodeURIComponent(proyectoId)}`,
        request,
        { signal },
      );
      return response.data;
    },
    async finalizar(proyectoId, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/finalizacion`,
        undefined,
        { signal },
      );
      return response.data;
    },
  };
}
