export function crearListarColaboracionesDeProyecto(httpClient) {
  return function listarColaboracionesDeProyecto(proyectoId, options = {}) {
    return httpClient.listarPorProyecto(proyectoId, options);
  };
}
