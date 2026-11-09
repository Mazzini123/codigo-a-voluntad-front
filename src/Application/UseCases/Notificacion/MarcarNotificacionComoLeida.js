export function crearMarcarNotificacionComoLeida(httpClient) {
  return function marcarNotificacionComoLeida(
    colaboradorId,
    notificacionId,
    options = {},
  ) {
    return httpClient.marcarComoLeida(colaboradorId, notificacionId, options);
  };
}
