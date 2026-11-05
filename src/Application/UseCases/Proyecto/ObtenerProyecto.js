/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearObtenerProyecto(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ProyectoDto.js').ProyectoDto>}
   */
  return function obtenerProyecto(proyectoId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, options);
  };
}
