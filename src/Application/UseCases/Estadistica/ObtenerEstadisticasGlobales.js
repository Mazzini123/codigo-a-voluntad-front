/** @param {import('../../Domain/HttpClients/IEstadisticaHttpClient.js').IEstadisticaHttpClient} httpClient */
export function crearObtenerEstadisticasGlobales(httpClient) {
  /**
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/EstadisticasGlobalesDto.js').EstadisticasGlobalesDto>}
   */
  return function obtenerEstadisticasGlobales(options = {}) {
    return httpClient.obtenerGlobales(options);
  };
}
