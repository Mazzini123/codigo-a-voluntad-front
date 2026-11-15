export function crearLimpiarContexto(httpClient) {
  return function limpiarContexto(options = {}) {
    return httpClient.limpiarContexto(options);
  };
}
