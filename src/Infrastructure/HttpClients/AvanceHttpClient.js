/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IAvanceHttpClient.js').IAvanceHttpClient}
 */
export function crearAvanceHttpClient(http) {
  return {
    async listar(proyectoId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/avances`,
        { signal },
      );
      return response.data;
    },
    async obtenerPorId(proyectoId, avanceId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/avances/${encodeURIComponent(avanceId)}`,
        { signal },
      );
      return response.data;
    },
    async registrar(proyectoId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/avances`,
        request,
        { signal },
      );
      return response.data;
    },
  };
}
