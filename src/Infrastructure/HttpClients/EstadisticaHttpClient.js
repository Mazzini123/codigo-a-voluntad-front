/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IEstadisticaHttpClient.js').IEstadisticaHttpClient}
 */
export function crearEstadisticaHttpClient(http) {
  return {
    async obtenerGlobales({ signal } = {}) {
      const response = await http.get("/estadisticas", { signal });
      return response.data;
    },
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      const response = await http.get(
        `/colectivos/${encodeURIComponent(colectivoId)}/estadisticas`,
        { signal },
      );
      return response.data;
    },
  };
}
