export function crearListarSolicitudesDeIngreso(httpClient) {
  return function listarSolicitudesDeIngreso(colectivoId, query = {}, options = {}) {
    return httpClient.listarSolicitudes(colectivoId, query, options);
  };
}
