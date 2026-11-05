/** @param {import('../../Domain/HttpClients/IReclutamientoHttpClient.js').IReclutamientoHttpClient} httpClient */
export function crearBuscarColaboradorasPotenciales(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {import('../../Domain/Requests/App/PaginacionRequest.js').PaginacionRequest} [query]
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PaginaDto.js').PaginaDto<import('../../Domain/Entities/ColaboradoraPotencialDto.js').ColaboradoraPotencialDto>>}
   */
  return function buscarColaboradorasPotenciales(
    proyectoId,
    perfilId,
    query = {},
    options = {},
  ) {
    return httpClient.buscarColaboradoras(proyectoId, perfilId, query, options);
  };
}
