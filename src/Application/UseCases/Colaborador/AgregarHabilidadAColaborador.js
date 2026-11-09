export function crearAgregarHabilidadAColaborador(httpClient) {
  return function agregarHabilidadAColaborador(colaboradorId, request, options = {}) {
    return httpClient.agregarHabilidad(colaboradorId, request, options);
  };
}
