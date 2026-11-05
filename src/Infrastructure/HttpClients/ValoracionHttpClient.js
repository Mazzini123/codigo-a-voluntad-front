/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IValoracionHttpClient.js').IValoracionHttpClient}
 */
export function crearValoracionHttpClient(http) {
  return {
    async valorar(proyectoId, colaboracionId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones/${encodeURIComponent(colaboracionId)}/valoraciones`,
        request,
        { signal },
      );
      return response.data;
    },
    async obtenerDeColectivo(colectivoId, { signal } = {}) {
      const response = await http.get(
        `/colectivos/${encodeURIComponent(colectivoId)}/valoraciones`,
        { signal },
      );
      return response.data;
    },
    async obtenerDeColaborador(colaboradorId, { signal } = {}) {
      const response = await http.get(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/valoraciones`,
        { signal },
      );
      return response.data;
    },
  };
}
