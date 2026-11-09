export function crearActualizarColectivo(httpClient) {
  return function actualizarColectivo(colectivoId, request, options = {}) {
    return httpClient.actualizar(colectivoId, request, options);
  };
}
