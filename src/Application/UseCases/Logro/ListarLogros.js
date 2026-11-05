/** @param {import('../../Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient} httpClient */
export function crearListarLogros(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/LogroDto.js').LogroDto[]>}
   */
  return function listarLogros(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
