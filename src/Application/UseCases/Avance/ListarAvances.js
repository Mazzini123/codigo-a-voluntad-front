/** @param {import('../../Domain/HttpClients/IAvanceHttpClient.js').IAvanceHttpClient} httpClient */
export function crearListarAvances(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/AvanceDto.js').AvanceDto[]>}
   */
  return function listarAvances(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
