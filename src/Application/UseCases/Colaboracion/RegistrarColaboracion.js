/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearRegistrarColaboracion(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {import('../../Domain/Requests/Colaboracion/RegistrarColaboracionRequest.js').RegistrarColaboracionRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDto.js').ColaboracionDto>}
   */
  return function registrarColaboracion(proyectoId, request, options = {}) {
    return httpClient.registrar(proyectoId, request, options);
  };
}
