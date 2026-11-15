export function crearCrearColectivo(httpClient) {
  return function crearColectivo(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
