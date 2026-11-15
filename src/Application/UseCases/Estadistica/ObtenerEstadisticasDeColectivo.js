export function crearObtenerEstadisticasDeColectivo(httpClient) {
  return function obtenerEstadisticasDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
