export function crearDestacarProyecto(httpClient) {
  return function destacarProyecto(proyectoId, hasta, options = {}) {
    return httpClient.destacar(proyectoId, { hasta }, options);
  };
}
