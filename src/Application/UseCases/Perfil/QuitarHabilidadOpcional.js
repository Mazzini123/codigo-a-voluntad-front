/** @param {import('../../Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient} httpClient */
export function crearQuitarHabilidadOpcional(httpClient) {
  /**
   * @param {string} proyectoId
   * @param {string} perfilId
   * @param {string} codigoHabilidad
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/PerfilDto.js').PerfilDto>}
   */
  return function quitarHabilidadOpcional(
    proyectoId,
    perfilId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidadOpcional(
      proyectoId,
      perfilId,
      codigoHabilidad,
      options,
    );
  };
}
