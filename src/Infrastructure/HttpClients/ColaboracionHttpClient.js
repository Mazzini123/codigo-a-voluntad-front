/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IColaboracionHttpClient.js').IColaboracionHttpClient}
 */
export function crearColaboracionHttpClient(http) {
  return {
    async desvincular(proyectoId, colaboracionId, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones/${encodeURIComponent(colaboracionId)}/desvinculacion`,
        undefined,
        { signal },
      );
      return response.data;
    },
    async registrar(proyectoId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones`,
        request,
        { signal },
      );
      return response.data;
    },
    async listarPorProyecto(proyectoId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones`,
        { signal },
      );
      return response.data;
    },
    async listarPorColaborador(colaboradorId, { signal } = {}) {
      const response = await http.get(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/colaboraciones`,
        { signal },
      );
      return response.data;
    },
    async aceptar(proyectoId, colaboracionId, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones/${encodeURIComponent(colaboracionId)}/aceptacion`,
        undefined,
        { signal },
      );
      return response.data;
    },
    async rechazar(proyectoId, colaboracionId, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones/${encodeURIComponent(colaboracionId)}/rechazo`,
        undefined,
        { signal },
      );
      return response.data;
    },
    async finalizar(proyectoId, colaboracionId, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/colaboraciones/${encodeURIComponent(colaboracionId)}/finalizacion`,
        undefined,
        { signal },
      );
      return response.data;
    },
  };
}
