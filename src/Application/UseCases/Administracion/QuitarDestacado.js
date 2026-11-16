export function crearQuitarDestacado(httpClient) {
  return function quitarDestacado(proyectoId, options = {}) {
    return httpClient.quitar(proyectoId, options);
  };
}
