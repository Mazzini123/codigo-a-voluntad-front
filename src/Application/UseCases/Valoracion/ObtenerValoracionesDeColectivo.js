/** @param {import('../../Domain/HttpClients/IValoracionHttpClient.js').IValoracionHttpClient} httpClient */
export function crearObtenerValoracionesDeColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ResumenValoracionesDto.js').ResumenValoracionesDto<import('../../Domain/Entities/ValoracionDeColectivoDto.js').ValoracionDeColectivoDto>>}
   */
  return function obtenerValoracionesDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
