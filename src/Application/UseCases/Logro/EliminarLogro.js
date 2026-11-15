export function crearEliminarLogro(httpClient) {
  return function eliminarLogro(proyectoId, logroId, options = {}) {
    return httpClient.eliminar(proyectoId, logroId, options);
  };
}
