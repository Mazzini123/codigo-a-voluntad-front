export function crearAceptarSolicitudDeIngreso(httpClient) {
  return function aceptarSolicitudDeIngreso(colectivoId, solicitudId, options = {}) {
    return httpClient.aceptarSolicitud(colectivoId, solicitudId, options);
  };
}
