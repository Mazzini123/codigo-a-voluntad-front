/** @param {import('../../Domain/HttpClients/IAuthHttpClient.js').IAuthHttpClient} httpClient */
export function crearObtenerCuentaActual(httpClient) {
  /**
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/CuentaDto.js').CuentaDto>}
   */
  return function obtenerCuentaActual(options = {}) {
    return httpClient.obtenerCuentaActual(options);
  };
}
