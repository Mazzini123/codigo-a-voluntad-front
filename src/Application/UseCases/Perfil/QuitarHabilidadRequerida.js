export function crearQuitarHabilidadRequerida(httpClient) {
  return function quitarHabilidadRequerida(
    proyectoId,
    perfilId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidadRequerida(
      proyectoId,
      perfilId,
      codigoHabilidad,
      options,
    );
  };
}
