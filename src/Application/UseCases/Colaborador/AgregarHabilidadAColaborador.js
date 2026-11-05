/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearAgregarHabilidadAColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function agregarHabilidadAColaborador(colaboradorId, request, options = {}) {
    return httpClient.agregarHabilidad(colaboradorId, request, options);
  };
}
