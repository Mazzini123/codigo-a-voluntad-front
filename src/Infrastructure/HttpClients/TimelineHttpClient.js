/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/ITimelineHttpClient.js').ITimelineHttpClient}
 */
export function crearTimelineHttpClient(http) {
  return {
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      const response = await http.get(
        `/colectivos/${encodeURIComponent(colectivoId)}/timeline`,
        { signal },
      );
      return response.data;
    },
  };
}
