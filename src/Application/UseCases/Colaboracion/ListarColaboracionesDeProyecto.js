/** @param {import('../../Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient} httpClient */
export function crearListarColaboracionesDeProyecto(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboracionDto.js').ColaboracionDto[]>}
   */
  return function listarColaboracionesDeProyecto(proyectoId, options = {}) {
    return httpClient.listarPorProyecto(proyectoId, options);
  };
}
