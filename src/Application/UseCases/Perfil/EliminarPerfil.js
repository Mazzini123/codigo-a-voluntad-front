export function crearEliminarPerfil(httpClient) {
  return function eliminarPerfil(proyectoId, perfilId, options = {}) {
    return httpClient.eliminar(proyectoId, perfilId, options);
  };
}
