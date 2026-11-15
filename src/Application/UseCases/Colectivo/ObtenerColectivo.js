export function crearObtenerColectivo(httpClient) {
  return function obtenerColectivo(colectivoId, options = {}) {
    return httpClient.obtenerPorId(colectivoId, options);
  };
}
