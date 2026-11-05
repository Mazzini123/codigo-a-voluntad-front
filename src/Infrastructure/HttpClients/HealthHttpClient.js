/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IHealthHttpClient.js').IHealthHttpClient}
 */
export function crearHealthHttpClient(http) {
  return {
    async consultar({ signal } = {}) {
      const response = await http.get("/health", { signal });
      return response.data;
    },
  };
}
