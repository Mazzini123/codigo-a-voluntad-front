/** @param {import('../../Domain/HttpClients/IHabilidadHttpClient.js').IHabilidadHttpClient} httpClient */
export function crearListarHabilidades(httpClient) {
  /**
   * @param {import('../../Domain/Requests/App/PaginacionRequest.js').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   */
  return function listarHabilidades(query = {}, options = {}) {
    return httpClient.listar(query, options);
  };
}
