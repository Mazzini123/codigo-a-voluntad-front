/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearAgregarHabilidadOpcional(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {import('../../Domain/Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function agregarHabilidadOpcional(proyectoId, perfilId, request, options = {}) {
    return httpClient.agregarHabilidadOpcional(proyectoId, perfilId, request, options);
  };
}
