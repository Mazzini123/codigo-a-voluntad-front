/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IAuthHttpClient.js').IAuthHttpClient}
 */
export function crearAuthHttpClient(http) {
  return {
    async obtenerCuentaActual({ signal } = {}) {
      const response = await http.get("/auth/me", { signal });
      return response.data;
    },
  };
}
