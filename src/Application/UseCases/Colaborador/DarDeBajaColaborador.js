export function crearDarDeBajaColaborador(httpClient) {
  return function darDeBajaColaborador(colaboradorId, options = {}) {
    return httpClient.darDeBaja(colaboradorId, options);
  };
}
