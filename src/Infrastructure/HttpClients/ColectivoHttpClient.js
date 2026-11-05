/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IColectivoHttpClient.js').IColectivoHttpClient}
 */
export function crearColectivoHttpClient(http) {
  return {
    async listar(query = {}, { signal } = {}) {
      const response = await http.get("/colectivos", { params: query, signal });
      return response.data;
    },
    async obtenerPorId(colectivoId, { signal } = {}) {
      const response = await http.get(`/colectivos/${encodeURIComponent(colectivoId)}`, {
        signal,
      });
      return response.data;
    },
    async crear(request, { signal } = {}) {
      const response = await http.post("/colectivos", request, { signal });
      return response.data;
    },
    async actualizar(colectivoId, request, { signal } = {}) {
      const response = await http.put(
        `/colectivos/${encodeURIComponent(colectivoId)}`,
        request,
        { signal },
      );
      return response.data;
    },
    async darDeBaja(colectivoId, { signal } = {}) {
      const response = await http.post(
        `/colectivos/${encodeURIComponent(colectivoId)}/baja`,
        undefined,
        { signal },
      );
      return response.data;
    },
  };
}
