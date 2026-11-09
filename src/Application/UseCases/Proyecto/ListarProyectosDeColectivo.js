export function crearListarProyectosDeColectivo(httpClient) {
  return function listarProyectosDeColectivo(colectivoId, options = {}) {
    return httpClient.listarPorColectivo(colectivoId, options);
  };
}
