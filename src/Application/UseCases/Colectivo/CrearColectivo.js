/** @param {import('../../Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient} httpClient */
export function crearCrearColectivo(httpClient) {
  /**
   * @param {import('../../Domain/Requests/Colectivo/CrearColectivoRequest.js').CrearColectivoRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColectivoDto.js').ColectivoDto>}
   */
  return function crearColectivo(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
