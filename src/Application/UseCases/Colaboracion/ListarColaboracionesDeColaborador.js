export function crearListarColaboracionesDeColaborador(httpClient) {
  return function listarColaboracionesDeColaborador(colaboradorId, options = {}) {
    return httpClient.listarPorColaborador(colaboradorId, options);
  };
}
