/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearRechazarPostulacion(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} colaboracionId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDto.js').ColaboracionDto>}
   */
  return function rechazarPostulacion(proyectoId, colaboracionId, options = {}) {
    return httpClient.rechazar(proyectoId, colaboracionId, options);
  };
}
