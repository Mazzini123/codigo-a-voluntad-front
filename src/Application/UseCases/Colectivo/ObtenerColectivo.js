/** @param {import('../../Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient} httpClient */
export function crearObtenerColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColectivoDto.js').ColectivoDto>}
   */
  return function obtenerColectivo(colectivoId, options = {}) {
    return httpClient.obtenerPorId(colectivoId, options);
  };
}
