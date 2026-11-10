export function crearReactivarColaborador(httpClient) {
  return function reactivarColaborador(colaboradorId, options = {}) {
    return httpClient.reactivar(colaboradorId, options);
  };
}
