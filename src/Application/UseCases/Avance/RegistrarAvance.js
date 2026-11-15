export function crearRegistrarAvance(httpClient) {
  return function registrarAvance(proyectoId, request, options = {}) {
    return httpClient.registrar(proyectoId, request, options);
  };
}
