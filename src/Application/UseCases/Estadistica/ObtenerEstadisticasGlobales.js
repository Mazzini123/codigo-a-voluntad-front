export function crearObtenerEstadisticasGlobales(httpClient) {
  return function obtenerEstadisticasGlobales(options = {}) {
    return httpClient.obtenerGlobales(options);
  };
}
