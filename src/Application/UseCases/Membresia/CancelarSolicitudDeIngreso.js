export function crearCancelarSolicitudDeIngreso(httpClient) {
  return function cancelarSolicitudDeIngreso(colectivoId, solicitudId, options = {}) {
    return httpClient.cancelarSolicitud(colectivoId, solicitudId, options);
  };
}
