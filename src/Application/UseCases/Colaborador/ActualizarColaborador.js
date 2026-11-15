export function crearActualizarColaborador(httpClient) {
  return function actualizarColaborador(colaboradorId, request, options = {}) {
    return httpClient.actualizar(colaboradorId, request, options);
  };
}
