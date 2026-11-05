/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearAgregarPronombre(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/Colaborador/AgregarPronombreRequest.js').AgregarPronombreRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function agregarPronombre(colaboradorId, request, options = {}) {
    return httpClient.agregarPronombre(colaboradorId, request, options);
  };
}
