/** @param {import('../../Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient} httpClient */
export function crearDarDeBajaColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColectivoDto.js').ColectivoDto>}
   */
  return function darDeBajaColectivo(colectivoId, options = {}) {
    return httpClient.darDeBaja(colectivoId, options);
  };
}
