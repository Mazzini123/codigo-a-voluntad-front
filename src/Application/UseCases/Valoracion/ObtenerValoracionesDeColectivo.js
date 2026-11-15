export function crearObtenerValoracionesDeColectivo(httpClient) {
  return function obtenerValoracionesDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
