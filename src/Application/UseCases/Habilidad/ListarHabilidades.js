/** @param {import('../../Domain/HttpClients/IHabilidadHttpClient').IHabilidadHttpClient} httpClient */
export function crearListarHabilidades(httpClient) {
  /**
   * @param {import('../../Domain/Requests/App/PaginacionRequest').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   */
  return function listarHabilidades(query = {}, options = {}) {
    return httpClient.listar(query, options);
  };
}
