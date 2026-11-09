import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearPerfilHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(proyectoId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/perfiles`, { signal });
    },
    async obtenerPorId(proyectoId, perfilId, { signal } = {}) {
      return api.get(ruta`/proyectos/${proyectoId}/perfiles/${perfilId}`, { signal });
    },
    async crear(proyectoId, request, { signal } = {}) {
      return api.post(ruta`/proyectos/${proyectoId}/perfiles`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async actualizar(proyectoId, perfilId, request, { signal } = {}) {
      return api.put(ruta`/proyectos/${proyectoId}/perfiles/${perfilId}`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async eliminar(proyectoId, perfilId, { signal } = {}) {
      await http.delete(ruta`/proyectos/${proyectoId}/perfiles/${perfilId}`, {
        signal,
        requiereSesion: true,
      });
    },
    async agregarHabilidadRequerida(proyectoId, perfilId, request, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/habilidades-requeridas`,
        request,
        { signal, requiereSesion: true },
      );
    },
    async quitarHabilidadRequerida(
      proyectoId,
      perfilId,
      codigoHabilidad,
      { signal } = {},
    ) {
      return api.delete(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/habilidades-requeridas/${codigoHabilidad}`,
        { signal, requiereSesion: true },
      );
    },
    async agregarHabilidadOpcional(proyectoId, perfilId, request, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/habilidades-opcionales`,
        request,
        { signal, requiereSesion: true },
      );
    },
    async quitarHabilidadOpcional(
      proyectoId,
      perfilId,
      codigoHabilidad,
      { signal } = {},
    ) {
      return api.delete(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/habilidades-opcionales/${codigoHabilidad}`,
        { signal, requiereSesion: true },
      );
    },
  };
}
