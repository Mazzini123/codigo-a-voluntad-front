export function crearActualizarProyecto(httpClient) {
  return function actualizarProyecto(proyectoId, request, options = {}) {
    return httpClient.actualizar(proyectoId, request, options);
  };
}
