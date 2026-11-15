export function crearRetirarPostulacion(httpClient) {
  return function retirarPostulacion(proyectoId, colaboracionId, options = {}) {
    return httpClient.retirar(proyectoId, colaboracionId, options);
  };
}
