/** @param {import('../../Domain/HttpClients/IHealthHttpClient.js').IHealthHttpClient} httpClient */
export function crearConsultarHealth(httpClient) {
  /**
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/HealthDto.js').HealthDto>}
   */
  return function consultarHealth(options = {}) {
    return httpClient.consultar(options);
  };
}
