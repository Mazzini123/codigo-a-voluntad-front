/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearListarColaboracionesDeColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDeColaboradorDto.js').ColaboracionDeColaboradorDto[]>}
   */
  return function listarColaboracionesDeColaborador(colaboradorId, options = {}) {
    return httpClient.listarPorColaborador(colaboradorId, options);
  };
}
