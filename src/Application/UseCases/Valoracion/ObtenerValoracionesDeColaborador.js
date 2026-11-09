export function crearObtenerValoracionesDeColaborador(httpClient) {
  return function obtenerValoracionesDeColaborador(colaboradorId, options = {}) {
    return httpClient.obtenerDeColaborador(colaboradorId, options);
  };
}
