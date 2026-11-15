export function crearObtenerProyecto(httpClient) {
  return function obtenerProyecto(proyectoId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, options);
  };
}
