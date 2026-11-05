/** @param {import('../../Domain/HttpClients/INotificacionHttpClient.js').INotificacionHttpClient} httpClient */
export function crearMarcarNotificacionComoLeida(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {string} notificacionId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/NotificacionDto.js').NotificacionDto>}
   */
  return function marcarNotificacionComoLeida(
    colaboradorId,
    notificacionId,
    options = {},
  ) {
    return httpClient.marcarComoLeida(colaboradorId, notificacionId, options);
  };
}
