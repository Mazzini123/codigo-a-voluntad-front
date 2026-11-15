export function crearObtenerColaborador(httpClient) {
  return function obtenerColaborador(colaboradorId, options = {}) {
    return httpClient.obtenerPorId(colaboradorId, options);
  };
}
