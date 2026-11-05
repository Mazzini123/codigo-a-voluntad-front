/** @param {import('../../Domain/HttpClients/IAvanceHttpClient.js').IAvanceHttpClient} httpClient */
export function crearObtenerAvance(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} avanceId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/AvanceDto.js').AvanceDto>}
   */
  return function obtenerAvance(proyectoId, avanceId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, avanceId, options);
  };
}
