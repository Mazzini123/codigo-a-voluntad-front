/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearObtenerPerfil(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function obtenerPerfil(proyectoId, perfilId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, perfilId, options);
  };
}
