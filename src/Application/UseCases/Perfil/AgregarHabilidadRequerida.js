export function crearAgregarHabilidadRequerida(httpClient) {
  return function agregarHabilidadRequerida(proyectoId, perfilId, request, options = {}) {
    return httpClient.agregarHabilidadRequerida(proyectoId, perfilId, request, options);
  };
}
