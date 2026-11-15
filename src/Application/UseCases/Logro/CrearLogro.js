export function crearCrearLogro(httpClient) {
  return function crearLogro(proyectoId, request, options = {}) {
    return httpClient.crear(proyectoId, request, options);
  };
}
