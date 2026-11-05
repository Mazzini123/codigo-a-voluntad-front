/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/INotificacionHttpClient.js').INotificacionHttpClient}
 */
export function crearNotificacionHttpClient(http) {
  return {
    async listar(colaboradorId, query = {}, { signal } = {}) {
      const response = await http.get(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/notificaciones`,
        { params: query, signal },
      );
      return response.data;
    },
    async marcarComoLeida(colaboradorId, notificacionId, { signal } = {}) {
      const response = await http.post(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/notificaciones/${encodeURIComponent(notificacionId)}/lectura`,
        undefined,
        { signal },
      );
      return response.data;
    },
  };
}
