export function crearSeleccionarContexto(httpClient) {
  return function seleccionarContexto(contextoId, options = {}) {
    return httpClient.seleccionarContexto({ contextoId }, options);
  };
}
