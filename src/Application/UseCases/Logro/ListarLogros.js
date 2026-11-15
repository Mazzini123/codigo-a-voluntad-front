export function crearListarLogros(httpClient) {
  return function listarLogros(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
