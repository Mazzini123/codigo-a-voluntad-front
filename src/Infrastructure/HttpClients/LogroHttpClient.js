/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient}
 */
export function crearLogroHttpClient(http) {
  return {
    async listar(proyectoId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/logros`,
        { signal },
      );
      return response.data;
    },
    async obtenerPorId(proyectoId, logroId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/logros/${encodeURIComponent(logroId)}`,
        { signal },
      );
      return response.data;
    },
    async crear(proyectoId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/logros`,
        request,
        { signal },
      );
      return response.data;
    },
    async actualizar(proyectoId, logroId, request, { signal } = {}) {
      const response = await http.put(
        `/proyectos/${encodeURIComponent(proyectoId)}/logros/${encodeURIComponent(logroId)}`,
        request,
        { signal },
      );
      return response.data;
    },
    async eliminar(proyectoId, logroId, { signal } = {}) {
      await http.delete(
        `/proyectos/${encodeURIComponent(proyectoId)}/logros/${encodeURIComponent(logroId)}`,
        { signal },
      );
    },
  };
}
