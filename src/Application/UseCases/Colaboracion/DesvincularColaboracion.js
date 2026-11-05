/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearDesvincularColaboracion(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} colaboracionId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDto.js').ColaboracionDto>}
   */
  return function desvincularColaboracion(proyectoId, colaboracionId, options = {}) {
    return httpClient.desvincular(proyectoId, colaboracionId, options);
  };
}
