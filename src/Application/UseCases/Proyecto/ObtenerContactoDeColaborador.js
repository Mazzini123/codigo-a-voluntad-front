/** @param {import('../../Domain/HttpClients/IProyectoHttpClient.js').IProyectoHttpClient} httpClient */
export function crearObtenerContactoDeColaborador(httpClient) {
  /**
   * Backend sólo comparte el contacto si hay una postulación aceptada; puede responder 403.
   * @param {string} proyectoId
   * @param {string} colaboradorId
   * @param {{signal?: AbortSignal}} [options]
   * @returns {Promise<import('../../Domain/Entities/MedioDeContactoDto.js').MedioDeContactoDto[]>}
   */
  return function obtenerContactoDeColaborador(proyectoId, colaboradorId, options = {}) {
    return httpClient.obtenerContactoDeColaborador(proyectoId, colaboradorId, options);
  };
}
