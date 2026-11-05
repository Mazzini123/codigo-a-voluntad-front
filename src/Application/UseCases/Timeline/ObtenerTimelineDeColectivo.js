/** @param {import('../../Domain/HttpClients/ITimelineHttpClient.js').ITimelineHttpClient} httpClient */
export function crearObtenerTimelineDeColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/EventoTimelineDto.js').EventoTimelineDto[]>}
   */
  return function obtenerTimelineDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
