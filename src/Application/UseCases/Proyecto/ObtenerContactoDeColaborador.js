export function crearObtenerContactoDeColaborador(httpClient) {
  return function obtenerContactoDeColaborador(proyectoId, colaboradorId, options = {}) {
    return httpClient.obtenerContactoDeColaborador(proyectoId, colaboradorId, options);
  };
}
