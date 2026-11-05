/** @param {import('../../Domain/HttpClients/ILogroHttpClient.js').ILogroHttpClient} httpClient */
export function crearEliminarLogro(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} logroId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<void>}
   */
  return function eliminarLogro(proyectoId, logroId, options = {}) {
    return httpClient.eliminar(proyectoId, logroId, options);
  };
}
