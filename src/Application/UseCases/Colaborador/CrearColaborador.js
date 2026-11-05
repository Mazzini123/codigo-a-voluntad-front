/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearCrearColaborador(httpClient) {
  /**
   * @param {import('../../Domain/Requests/Colaborador/CrearColaboradorRequest.js').CrearColaboradorRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function crearColaborador(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
