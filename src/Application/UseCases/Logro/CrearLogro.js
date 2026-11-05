/** @param {import('../../Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient} httpClient */
export function crearCrearLogro(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {import('../../Domain/Requests/Logro/CrearLogroRequest.js').CrearLogroRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/LogroDto.js').LogroDto>}
   */
  return function crearLogro(proyectoId, request, options = {}) {
    return httpClient.crear(proyectoId, request, options);
  };
}
