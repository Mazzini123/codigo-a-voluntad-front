export function crearActualizarPerfil(httpClient) {
  return function actualizarPerfil(proyectoId, perfilId, request, options = {}) {
    return httpClient.actualizar(proyectoId, perfilId, request, options);
  };
}
