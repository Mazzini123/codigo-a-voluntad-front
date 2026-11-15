export function crearDesvincularColaboracion(httpClient) {
  return function desvincularColaboracion(proyectoId, colaboracionId, options = {}) {
    return httpClient.desvincular(proyectoId, colaboracionId, options);
  };
}
