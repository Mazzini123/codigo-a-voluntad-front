export function crearAgregarPronombre(httpClient) {
  return function agregarPronombre(colaboradorId, request, options = {}) {
    return httpClient.agregarPronombre(colaboradorId, request, options);
  };
}
