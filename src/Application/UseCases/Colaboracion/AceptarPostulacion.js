export function crearAceptarPostulacion(httpClient) {
  return function aceptarPostulacion(proyectoId, colaboracionId, options = {}) {
    return httpClient.aceptar(proyectoId, colaboracionId, options);
  };
}
