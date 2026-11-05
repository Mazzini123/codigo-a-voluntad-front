/** @param {import('../../Domain/HttpClients/IEstadisticaHttpClient.js').IEstadisticaHttpClient} httpClient */
export function crearObtenerEstadisticasDeColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/EstadisticasColectivoDto.js').EstadisticasColectivoDto>}
   */
  return function obtenerEstadisticasDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
