import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearReclutamientoHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async buscarColaboradoras(proyectoId, perfilId, query = {}, { signal } = {}) {
      return api.get(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/colaboradoras-potenciales`,
        { params: query, signal, requiereSesion: true },
      );
    },
    async buscarProyectos(colaboradorId, query = {}, { signal } = {}) {
      return api.get(ruta`/colaboradores/${colaboradorId}/proyectos-potenciales`, {
        params: query,
        signal,
        requiereSesion: true,
      });
    },
    async invitar(proyectoId, perfilId, request, { signal } = {}) {
      return api.post(
        ruta`/proyectos/${proyectoId}/perfiles/${perfilId}/invitaciones`,
        request,
        { signal, requiereSesion: true },
      );
    },
  };
}
