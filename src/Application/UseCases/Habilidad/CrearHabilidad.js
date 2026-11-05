/** @param {import('../../Domain/HttpClients/IHabilidadHttpClient.js').IHabilidadHttpClient} httpClient */
export function crearCrearHabilidad(httpClient) {
  /**
   * @param {import('../../Domain/Requests/Habilidad/CrearHabilidadRequest.js').CrearHabilidadRequest} request
   * @param {{signal?: AbortSignal}} [options]
   */
  return function crearHabilidad(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
