export function crearAgregarMedioDeContacto(httpClient) {
  return function agregarMedioDeContacto(colaboradorId, request, options = {}) {
    return httpClient.agregarMedioDeContacto(colaboradorId, request, options);
  };
}
