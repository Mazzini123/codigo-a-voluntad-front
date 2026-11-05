/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearCrearPerfil(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {import('../../Domain/Requests/Perfil/CrearPerfilRequest.js').CrearPerfilRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function crearPerfil(proyectoId, request, options = {}) {
    return httpClient.crear(proyectoId, request, options);
  };
}
