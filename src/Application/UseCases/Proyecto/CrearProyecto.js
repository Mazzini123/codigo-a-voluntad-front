/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearCrearProyecto(httpClient) {
  /**
   * @param {string} colectivoId
   * @param {import('../../Domain/Requests/Proyecto/CrearProyectoRequest.js').CrearProyectoRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>}
   */
  return function crearProyecto(colectivoId, request, options = {}) {
    return httpClient.crear(colectivoId, request, options);
  };
}
