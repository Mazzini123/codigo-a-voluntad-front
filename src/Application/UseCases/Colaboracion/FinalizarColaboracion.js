export function crearFinalizarColaboracion(httpClient) {
  return function finalizarColaboracion(proyectoId, colaboracionId, options = {}) {
    return httpClient.finalizar(proyectoId, colaboracionId, options);
  };
}
