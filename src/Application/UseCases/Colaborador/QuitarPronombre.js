/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearQuitarPronombre(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {string} pronombre
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function quitarPronombre(colaboradorId, pronombre, options = {}) {
    return httpClient.quitarPronombre(colaboradorId, pronombre, options);
  };
}
