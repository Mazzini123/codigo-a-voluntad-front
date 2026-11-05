/** @param {import('../../Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient} httpClient */
export function crearActualizarColectivo(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {import('../../Domain/Requests/Colectivo/ActualizarColectivoRequest.js').ActualizarColectivoRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColectivoDto.js').ColectivoDto>}
   */
  return function actualizarColectivo(colectivoId, request, options = {}) {
    return httpClient.actualizar(colectivoId, request, options);
  };
}
