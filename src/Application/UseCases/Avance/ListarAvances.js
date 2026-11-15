export function crearListarAvances(httpClient) {
  return function listarAvances(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
