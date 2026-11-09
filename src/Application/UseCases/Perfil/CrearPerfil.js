export function crearCrearPerfil(httpClient) {
  return function crearPerfil(proyectoId, request, options = {}) {
    return httpClient.crear(proyectoId, request, options);
  };
}
