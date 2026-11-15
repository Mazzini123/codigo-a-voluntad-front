export function crearObtenerAvance(httpClient) {
  return function obtenerAvance(proyectoId, avanceId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, avanceId, options);
  };
}
