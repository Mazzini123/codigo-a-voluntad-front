export function crearObtenerLogro(httpClient) {
  return function obtenerLogro(proyectoId, logroId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, logroId, options);
  };
}
