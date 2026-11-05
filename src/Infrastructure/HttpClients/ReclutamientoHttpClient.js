/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IReclutamientoHttpClient.js').IReclutamientoHttpClient}
 */
export function crearReclutamientoHttpClient(http) {
  return {
    async buscarColaboradoras(proyectoId, perfilId, query = {}, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/colaboradoras-potenciales`,
        { params: query, signal },
      );
      return response.data;
    },
    async buscarProyectos(colaboradorId, query = {}, { signal } = {}) {
      const response = await http.get(
        `/colaboradores/${encodeURIComponent(colaboradorId)}/proyectos-potenciales`,
        { params: query, signal },
      );
      return response.data;
    },
    async invitar(proyectoId, perfilId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/invitaciones`,
        request,
        { signal },
      );
      return response.data;
    },
  };
}
