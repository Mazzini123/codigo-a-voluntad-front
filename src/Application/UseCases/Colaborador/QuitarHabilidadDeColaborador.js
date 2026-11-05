/** @param {import('../../Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient} httpClient */
export function crearQuitarHabilidadDeColaborador(httpClient) {
  /**
   * @param {string} colaboradorId
   * @param {string} codigoHabilidad
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/ColaboradorDto.js').ColaboradorDto>}
   */
  return function quitarHabilidadDeColaborador(
    colaboradorId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidad(colaboradorId, codigoHabilidad, options);
  };
}
