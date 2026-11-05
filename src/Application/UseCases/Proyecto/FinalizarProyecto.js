/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearFinalizarProyecto(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>}
   */
  return function finalizarProyecto(proyectoId, options = {}) {
    return httpClient.finalizar(proyectoId, options);
  };
}
