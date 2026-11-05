/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearAgregarMedioDeContacto(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {import('../../Domain/Requests/App/MedioDeContactoRequest.js').MedioDeContactoRequest} request
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/MedioDeContactoDto.js').MedioDeContactoDto>}
   */
  return function agregarMedioDeContacto(colaboradorId, request, options = {}) {
    return httpClient.agregarMedioDeContacto(colaboradorId, request, options);
  };
}
