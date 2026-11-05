/** @param {import('../../Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient} httpClient */
export function crearListarColectivos(httpClient) {
  /**
   * @param {import('../../Domain/Requests/App/ListadoConEtiquetaRequest.js').ListadoConEtiquetaRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/ColectivoDto.js').ColectivoDto>>}
   */
  return function listarColectivos(query = {}, options = {}) {
    return httpClient.listar(query, options);
  };
}
