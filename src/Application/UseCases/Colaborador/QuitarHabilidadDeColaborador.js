export function crearQuitarHabilidadDeColaborador(httpClient) {
  return function quitarHabilidadDeColaborador(
    colaboradorId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidad(colaboradorId, codigoHabilidad, options);
  };
}
