/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearActualizarColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/Colaborador/ActualizarColaboradorRequest.js').ActualizarColaboradorRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function actualizarColaborador(colaboradorId, request, options = {}) {
    return httpClient.actualizar(colaboradorId, request, options);
  };
}
