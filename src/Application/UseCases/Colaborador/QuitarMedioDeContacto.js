/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearQuitarMedioDeContacto(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {string} tipo
   * @param {string} valor
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<void>}
   */
  return function quitarMedioDeContacto(colaboradorId, tipo, valor, options = {}) {
    return httpClient.quitarMedioDeContacto(colaboradorId, tipo, valor, options);
  };
}
