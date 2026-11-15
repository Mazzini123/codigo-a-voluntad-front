export function crearObtenerPerfil(httpClient) {
  return function obtenerPerfil(proyectoId, perfilId, options = {}) {
    return httpClient.obtenerPorId(proyectoId, perfilId, options);
  };
}
