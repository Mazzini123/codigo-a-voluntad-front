/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearAgregarHabilidadRequerida(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {import('../../Domain/Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function agregarHabilidadRequerida(proyectoId, perfilId, request, options = {}) {
    return httpClient.agregarHabilidadRequerida(proyectoId, perfilId, request, options);
  };
}
