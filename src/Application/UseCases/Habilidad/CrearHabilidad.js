export function crearCrearHabilidad(httpClient) {
  return function crearHabilidad(request, options = {}) {
    return httpClient.crear(request, options);
  };
}
