/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearListarColaboradores(httpClient) {
  /**
   * @param {import('../../Domain/Requests/App/PaginacionRequest.js').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>>}
   */
  return function listarColaboradores(query = {}, options = {}) {
    return httpClient.listar(query, options);
  };
}
