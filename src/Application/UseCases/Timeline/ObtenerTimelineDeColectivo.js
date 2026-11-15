export function crearObtenerTimelineDeColectivo(httpClient) {
  return function obtenerTimelineDeColectivo(colectivoId, options = {}) {
    return httpClient.obtenerDeColectivo(colectivoId, options);
  };
}
