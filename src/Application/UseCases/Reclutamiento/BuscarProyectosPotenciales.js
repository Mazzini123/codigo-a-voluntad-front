/** @param {import('../../Domain/HttpClients/IReclutamientoHttpClient.js').IReclutamientoHttpClient} httpClient */
export function crearBuscarProyectosPotenciales(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/App/PaginacionRequest.js').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>>}
   */
  return function buscarProyectosPotenciales(colaboradorId, query = {}, options = {}) {
    return httpClient.buscarProyectos(colaboradorId, query, options);
  };
}
