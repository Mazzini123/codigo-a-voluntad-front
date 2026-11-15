import { crearPedidos, ruta } from "@/Infrastructure/Http/pedidos.js";

const PRIVADO = Object.freeze({ requiereSesion: true });

export function crearMembresiaHttpClient(http) {
  const api = crearPedidos(http);
  return {
    async listarMiembros(colectivoId, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/miembros`, { signal, ...PRIVADO });
    },
    async quitarMiembro(colectivoId, contextoId, { signal } = {}) {
      return api.delete(ruta`/colectivos/${colectivoId}/miembros/${contextoId}`, {
        signal,
        ...PRIVADO,
      });
    },
    async abandonar(colectivoId, { signal } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/abandono`, undefined, {
        signal,
        ...PRIVADO,
      });
    },
    async transferirLiderazgo(colectivoId, request, { signal } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/lider`, request, {
        signal,
        ...PRIVADO,
      });
    },
    async listarSolicitudes(colectivoId, query = {}, { signal } = {}) {
      return api.get(ruta`/colectivos/${colectivoId}/solicitudes-ingreso`, {
        params: query,
        signal,
        ...PRIVADO,
      });
    },
    async aceptarSolicitud(colectivoId, solicitudId, { signal } = {}) {
      return api.post(
        ruta`/colectivos/${colectivoId}/solicitudes-ingreso/${solicitudId}/aceptacion`,
        undefined,
        { signal, ...PRIVADO },
      );
    },
    async rechazarSolicitud(colectivoId, solicitudId, { signal } = {}) {
      return api.post(
        ruta`/colectivos/${colectivoId}/solicitudes-ingreso/${solicitudId}/rechazo`,
        undefined,
        { signal, ...PRIVADO },
      );
    },
    async solicitarIngreso(colectivoId, { signal } = {}) {
      return api.post(ruta`/colectivos/${colectivoId}/solicitudes-ingreso`, undefined, {
        signal,
        ...PRIVADO,
      });
    },
    async cancelarSolicitud(colectivoId, solicitudId, { signal } = {}) {
      return api.post(
        ruta`/colectivos/${colectivoId}/solicitudes-ingreso/${solicitudId}/cancelacion`,
        undefined,
        { signal, ...PRIVADO },
      );
    },
    async listarMisSolicitudes({ signal } = {}) {
      return api.get("/auth/solicitudes-ingreso", { signal, ...PRIVADO });
    },
  };
}
