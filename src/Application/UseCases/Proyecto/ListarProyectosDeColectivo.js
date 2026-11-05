/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearListarProyectosDeColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto[]>}
   */
  return function listarProyectosDeColectivo(colectivoId, options = {}) {
    return httpClient.listarPorColectivo(colectivoId, options);
  };
}
