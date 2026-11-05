/** @param {import('../../Domain/HttpClients/IValoracionHttpClient.js').IValoracionHttpClient} httpClient */
export function crearValorarColaboracion(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} colaboracionId
   * @param {import('../../Domain/Requests/Valoracion/ValorarColaboracionRequest.js').ValorarColaboracionRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ValoracionDto.js').ValoracionDto>}
   */
  return function valorarColaboracion(proyectoId, colaboracionId, request, options = {}) {
    return httpClient.valorar(proyectoId, colaboracionId, request, options);
  };
}
