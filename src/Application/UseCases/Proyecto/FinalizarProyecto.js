export function crearFinalizarProyecto(httpClient) {
  return function finalizarProyecto(proyectoId, options = {}) {
    return httpClient.finalizar(proyectoId, options);
  };
}
