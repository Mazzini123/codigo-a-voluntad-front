export function crearAgregarMedioDeContacto(httpClient) {
  return function agregarMedioDeContacto(colectivoId, request, options = {}) {
    return httpClient.agregarMedioDeContacto(colectivoId, request, options);
  };
}
