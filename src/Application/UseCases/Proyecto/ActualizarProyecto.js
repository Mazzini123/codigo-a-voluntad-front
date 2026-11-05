/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearActualizarProyecto(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {import('../../Domain/Requests/Proyecto/ActualizarProyectoRequest.js').ActualizarProyectoRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>}
   */
  return function actualizarProyecto(proyectoId, request, options = {}) {
    return httpClient.actualizar(proyectoId, request, options);
  };
}
