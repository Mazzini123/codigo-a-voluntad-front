export function crearRechazarSolicitudDeIngreso(httpClient) {
  return function rechazarSolicitudDeIngreso(colectivoId, solicitudId, options = {}) {
    return httpClient.rechazarSolicitud(colectivoId, solicitudId, options);
  };
}
