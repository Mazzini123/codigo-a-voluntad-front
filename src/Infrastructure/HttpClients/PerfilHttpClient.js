/**
 * @param {import('axios').AxiosInstance} http
 * @returns {import('../../Application/Domain/HttpClients/IPerfilHttpClient.js').IPerfilHttpClient}
 */
export function crearPerfilHttpClient(http) {
  return {
    async listar(proyectoId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles`,
        { signal },
      );
      return response.data;
    },
    async obtenerPorId(proyectoId, perfilId, { signal } = {}) {
      const response = await http.get(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}`,
        { signal },
      );
      return response.data;
    },
    async crear(proyectoId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles`,
        request,
        { signal },
      );
      return response.data;
    },
    async actualizar(proyectoId, perfilId, request, { signal } = {}) {
      const response = await http.put(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}`,
        request,
        { signal },
      );
      return response.data;
    },
    async eliminar(proyectoId, perfilId, { signal } = {}) {
      await http.delete(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}`,
        { signal },
      );
    },
    async agregarHabilidadRequerida(proyectoId, perfilId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/habilidades-requeridas`,
        request,
        { signal },
      );
      return response.data;
    },
    async quitarHabilidadRequerida(
      proyectoId,
      perfilId,
      codigoHabilidad,
      { signal } = {},
    ) {
      const response = await http.delete(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/habilidades-requeridas/${encodeURIComponent(codigoHabilidad)}`,
        { signal },
      );
      return response.data;
    },
    async agregarHabilidadOpcional(proyectoId, perfilId, request, { signal } = {}) {
      const response = await http.post(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/habilidades-opcionales`,
        request,
        { signal },
      );
      return response.data;
    },
    async quitarHabilidadOpcional(
      proyectoId,
      perfilId,
      codigoHabilidad,
      { signal } = {},
    ) {
      const response = await http.delete(
        `/proyectos/${encodeURIComponent(proyectoId)}/perfiles/${encodeURIComponent(perfilId)}/habilidades-opcionales/${encodeURIComponent(codigoHabilidad)}`,
        { signal },
      );
      return response.data;
    },
  };
}
