export function crearRechazarPostulacion(httpClient) {
  return function rechazarPostulacion(proyectoId, colaboracionId, options = {}) {
    return httpClient.rechazar(proyectoId, colaboracionId, options);
  };
}
