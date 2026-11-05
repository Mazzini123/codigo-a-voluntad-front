/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearFinalizarColaboracion(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} colaboracionId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDto.js').ColaboracionDto>}
   */
  return function finalizarColaboracion(proyectoId, colaboracionId, options = {}) {
    return httpClient.finalizar(proyectoId, colaboracionId, options);
  };
}
