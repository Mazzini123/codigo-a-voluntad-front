import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

export function crearColaboradorHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listar(query = {}, { signal } = {}) {
      return api.get("/colaboradores", { params: query, signal });
    },
    async obtenerPorId(colaboradorId, { signal } = {}) {
      return api.get(ruta`/colaboradores/${colaboradorId}`, { signal });
    },
    async crear(request, { signal } = {}) {
      return api.post("/colaboradores", request, {
        signal,
        requiereSesion: true,
      });
    },
    async actualizar(colaboradorId, request, { signal } = {}) {
      return api.put(ruta`/colaboradores/${colaboradorId}`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async agregarPronombre(colaboradorId, request, { signal } = {}) {
      return api.post(ruta`/colaboradores/${colaboradorId}/pronombres`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async quitarPronombre(colaboradorId, pronombre, { signal } = {}) {
      return api.delete(ruta`/colaboradores/${colaboradorId}/pronombres/${pronombre}`, {
        signal,
        requiereSesion: true,
      });
    },
    async agregarHabilidad(colaboradorId, request, { signal } = {}) {
      return api.post(ruta`/colaboradores/${colaboradorId}/habilidades`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async quitarHabilidad(colaboradorId, codigoHabilidad, { signal } = {}) {
      return api.delete(
        ruta`/colaboradores/${colaboradorId}/habilidades/${codigoHabilidad}`,
        { signal, requiereSesion: true },
      );
    },
    async agregarMedioDeContacto(colaboradorId, request, { signal } = {}) {
      return api.post(ruta`/colaboradores/${colaboradorId}/medios-de-contacto`, request, {
        signal,
        requiereSesion: true,
      });
    },
    async quitarMedioDeContacto(colaboradorId, tipo, valor, { signal } = {}) {
      await http.delete(
        ruta`/colaboradores/${colaboradorId}/medios-de-contacto/${tipo}/${valor}`,
        { signal, requiereSesion: true },
      );
    },
  };
}
