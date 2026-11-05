/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IColaboradorHttpClient.js').IColaboradorHttpClient}
 */
export function crearColaboradorHttpClient(http) {
  return {
    async listar(query = {}, { signal } = {}) {
      const response = await http.get("/colaboradores", { params: query, signal });
      return response.data;
    },
    async obtenerPorId(colaboradorId, { signal } = {}) {
      const response = await http.get(
        `/colaboradores/${encodeURIComponent(colaboradorId)}`,
        { signal },
      );
      return response.data;
    },
    async crear(request, { signal } = {}) {
      const response = await http.post("/colaboradores", request, { signal });
      return response.data;
    },
    async actualizar(colaboradorId, request, { signal } = {}) {
      const response = await http.put(
        `/colaboradores/${encodeURIComponent(colaboradorId)}`,
        request,
        { signal },
      );
      return response.data;
    },
    async agregarPronombre(colaboradorId, request, { signal } = {}) {
      const response = await http.post(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/pronombres`,
        request,
        { signal },
      );
      return response.data;
    },
    async quitarPronombre(colaboradorId, pronombre, { signal } = {}) {
      const response = await http.delete(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/pronombres/${encodeURIComponent(pronombre)}`,
        { signal },
      );
      return response.data;
    },
    async agregarHabilidad(colaboradorId, request, { signal } = {}) {
      const response = await http.post(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/habilidades`,
        request,
        { signal },
      );
      return response.data;
    },
    async quitarHabilidad(colaboradorId, codigoHabilidad, { signal } = {}) {
      const response = await http.delete(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/habilidades/${encodeURIComponent(codigoHabilidad)}`,
        { signal },
      );
      return response.data;
    },
    async agregarMedioDeContacto(colaboradorId, request, { signal } = {}) {
      const response = await http.post(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/medios-de-contacto`,
        request,
        { signal },
      );
      return response.data;
    },
    async quitarMedioDeContacto(colaboradorId, tipo, valor, { signal } = {}) {
      await http.delete(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/medios-de-contacto/${encodeURIComponent(tipo)}/${encodeURIComponent(valor)}`,
        { signal },
      );
    },
  };
}
