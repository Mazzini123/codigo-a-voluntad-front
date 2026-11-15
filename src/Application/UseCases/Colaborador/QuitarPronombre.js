export function crearQuitarPronombre(httpClient) {
  return function quitarPronombre(colaboradorId, pronombre, options = {}) {
    return httpClient.quitarPronombre(colaboradorId, pronombre, options);
  };
}
