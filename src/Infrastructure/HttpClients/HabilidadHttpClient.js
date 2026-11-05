/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IHabilidadHttpClient.js').IHabilidadHttpClient}
 */
export function crearHabilidadHttpClient(http) {
  return {
    async listar(query = {}, { signal } = {}) {
      const response = await http.get("/habilidades", { params: query, signal });
      return response.data;
    },
    async crear(request, { signal } = {}) {
      const response = await http.post("/habilidades", request, { signal });
      return response.data;
    },
  };
}
