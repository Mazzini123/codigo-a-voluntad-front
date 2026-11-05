/** @param {import('../../Domain/HttpClients/IAvanceHttpClient.js').IAvanceHttpClient} httpClient */
export function crearRegistrarAvance(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {import('../../Domain/Requests/Avance/RegistrarAvanceRequest.js').RegistrarAvanceRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/AvanceDto.js').AvanceDto>}
   */
  return function registrarAvance(proyectoId, request, options = {}) {
    return httpClient.registrar(proyectoId, request, options);
  };
}
