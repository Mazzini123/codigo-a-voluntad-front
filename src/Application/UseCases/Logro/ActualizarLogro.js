export function crearActualizarLogro(httpClient) {
  return function actualizarLogro(proyectoId, logroId, request, options = {}) {
    return httpClient.actualizar(proyectoId, logroId, request, options);
  };
}
