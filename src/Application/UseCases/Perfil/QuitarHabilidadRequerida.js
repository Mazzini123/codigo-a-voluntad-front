/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearQuitarHabilidadRequerida(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {string} codigoHabilidad
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function quitarHabilidadRequerida(
    proyectoId,
    perfilId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidadRequerida(
      proyectoId,
      perfilId,
      codigoHabilidad,
      options,
    );
  };
}
