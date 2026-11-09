export function crearAgregarHabilidadOpcional(httpClient) {
  return function agregarHabilidadOpcional(proyectoId, perfilId, request, options = {}) {
    return httpClient.agregarHabilidadOpcional(proyectoId, perfilId, request, options);
  };
}
