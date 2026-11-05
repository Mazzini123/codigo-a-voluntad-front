/** @param {import('../../Domain/HttpClients/INotificacionHttpClient.js').INotificacionHttpClient} httpClient */
export function crearListarNotificaciones(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/App/PaginacionRequest.js').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/NotificacionDto.js').NotificacionDto>>}
   */
  return function listarNotificaciones(colaboradorId, query = {}, options = {}) {
    return httpClient.listar(colaboradorId, query, options);
  };
}
