export function crearObtenerCuentaActual(httpClient) {
  return function obtenerCuentaActual(options = {}) {
    return httpClient.obtenerCuentaActual(options);
  };
}
