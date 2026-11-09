export function crearCrearColaborador(httpClient) {
  return function crearColaborador(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
