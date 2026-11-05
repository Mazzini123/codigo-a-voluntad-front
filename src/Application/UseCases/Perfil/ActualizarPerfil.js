/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearActualizarPerfil(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {import('../../Domain/Requests/Perfil/ActualizarPerfilRequest.js').ActualizarPerfilRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function actualizarPerfil(proyectoId, perfilId, request, options = {}) {
    return httpClient.actualizar(proyectoId, perfilId, request, options);
  };
}
