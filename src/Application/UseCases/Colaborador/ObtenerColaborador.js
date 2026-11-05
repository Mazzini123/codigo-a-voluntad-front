/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearObtenerColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function obtenerColaborador(colaboradorId, options = {}) {
    return httpClient.obtenerPorId(colaboradorId, options);
  };
}
