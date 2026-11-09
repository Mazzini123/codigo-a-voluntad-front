export function crearValorarColaboracion(httpClient) {
  return function valorarColaboracion(proyectoId, colaboracionId, request, options = {}) {
    return httpClient.valorar(proyectoId, colaboracionId, request, options);
  };
}
