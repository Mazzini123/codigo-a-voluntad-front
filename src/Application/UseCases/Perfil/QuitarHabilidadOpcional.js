export function crearQuitarHabilidadOpcional(httpClient) {
  return function quitarHabilidadOpcional(
    proyectoId,
    perfilId,
    codigoHabilidad,
    options = {},
  ) {
    return httpClient.quitarHabilidadOpcional(
      proyectoId,
      perfilId,
      codigoHabilidad,
      options,
    );
  };
}
