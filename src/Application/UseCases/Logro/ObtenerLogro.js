/** @param {import('../../Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient} httpClient */
export function crearObtenerLogro(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} logroId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/LogroDto.js').LogroDto>}
   */
  return function obtenerLogro(proyectoId, logroId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, logroId, options);
  };
}
