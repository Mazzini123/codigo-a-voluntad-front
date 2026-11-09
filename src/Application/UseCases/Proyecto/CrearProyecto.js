export function crearCrearProyecto(httpClient) {
  return function crearProyecto(colectivoId, request, options = {}) {
    return httpClient.crear(colectivoId, request, options);
  };
}
