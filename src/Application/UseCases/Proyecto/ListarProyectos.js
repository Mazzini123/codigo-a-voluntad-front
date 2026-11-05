/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearListarProyectos(httpClient) {
  /**
   * @param {import('../../Domain/Requests/App/ListadoConEtiquetaRequest.js').ListadoConEtiquetaRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>>}
   */
  return function listarProyectos(query = {}, options = {}) {
    return httpClient.listar(query, options);
  };
}
