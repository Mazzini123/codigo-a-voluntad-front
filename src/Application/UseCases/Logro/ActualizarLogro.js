/** @param {import('../../Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient} httpClient */
export function crearActualizarLogro(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} logroId
   * @param {import('../../Domain/Requests/Logro/ActualizarLogroRequest.js').ActualizarLogroRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/LogroDto.js').LogroDto>}
   */
  return function actualizarLogro(proyectoId, logroId, request, options = {}) {
    return httpClient.actualizar(proyectoId, logroId, request, options);
  };
}
