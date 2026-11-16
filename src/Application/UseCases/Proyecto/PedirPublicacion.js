export function crearPedirPublicacion(httpClient) {
  return function pedirPublicacion(proyectoId, options = {}) {
    return httpClient.pedirPublicacion(proyectoId, options);
  };
}
