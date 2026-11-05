/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearListarPerfiles(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto[]>}
   */
  return function listarPerfiles(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
