/** @param {import('../../Domain/HttpClients/IValoracionHttpClient.js').IValoracionHttpClient} httpClient */
export function crearObtenerValoracionesDeColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ResumenValoracionesDto.js').ResumenValoracionesDto<import('../../Domain/Entities/ValoracionDeColaboradorDto.js').ValoracionDeColaboradorDto>>}
   */
  return function obtenerValoracionesDeColaborador(colaboradorId, options = {}) {
    return httpClient.obtenerDeColaborador(colaboradorId, options);
  };
}
