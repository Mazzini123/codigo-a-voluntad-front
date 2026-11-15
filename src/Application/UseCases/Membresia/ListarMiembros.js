export function crearListarMiembros(httpClient) {
  return function listarMiembros(colectivoId, options = {}) {
    return httpClient.listarMiembros(colectivoId, options);
  };
}
