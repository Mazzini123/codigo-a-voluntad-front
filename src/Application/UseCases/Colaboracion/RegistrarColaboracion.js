export function crearRegistrarColaboracion(httpClient) {
  return function registrarColaboracion(proyectoId, request, options = {}) {
    return httpClient.registrar(proyectoId, request, options);
  };
}
