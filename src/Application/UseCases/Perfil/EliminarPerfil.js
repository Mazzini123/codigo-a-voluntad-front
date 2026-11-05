/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearEliminarPerfil(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<void>}
   */
  return function eliminarPerfil(proyectoId, perfilId, options = {}) {
    return httpClient.eliminar(proyectoId, perfilId, options);
  };
}
