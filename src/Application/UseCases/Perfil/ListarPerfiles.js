export function crearListarPerfiles(httpClient) {
  return function listarPerfiles(proyectoId, options = {}) {
    return httpClient.listar(proyectoId, options);
  };
}
