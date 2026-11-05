/** @param {import('../../Domain/HttpClients/IReclutamientoHttpClient.js').IReclutamientoHttpClient} httpClient */
export function crearInvitarColaborador(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {import('../../Domain/Requests/Reclutamiento/InvitarColaboradorRequest.js').InvitarColaboradorRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/NotificacionDto.js').NotificacionDto>}
   */
  return function invitarColaborador(proyectoId, perfilId, request, options = {}) {
    return httpClient.invitar(proyectoId, perfilId, request, options);
  };
}
