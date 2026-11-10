import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";

const ORDEN = [
  ESTADO_SOLICITUD.PENDIENTE,
  ESTADO_SOLICITUD.ACEPTADA,
  ESTADO_SOLICITUD.RECHAZADA,
  ESTADO_SOLICITUD.CANCELADA,
];

function posicion(solicitud) {
  const indice = ORDEN.indexOf(solicitud.estado);
  return indice === -1 ? ORDEN.length : indice;
}

async function nombresDeColectivos(colectivoHttpClient, ids, options) {
  const pares = await Promise.all(
    ids.map(async (id) => {
      try {
        const colectivo = await colectivoHttpClient.obtenerPorId(id, options);
        return [id, colectivo?.nombre ?? null];
      } catch (error) {
        if (options.signal?.aborted) throw error;
        return [id, null];
      }
    }),
  );
  return new Map(pares);
}

export function crearListarMisSolicitudesDeIngreso(httpClient, colectivoHttpClient) {
  return async function listarMisSolicitudesDeIngreso(options = {}) {
    const solicitudes = (await httpClient.listarMisSolicitudes(options)) ?? [];
    const ids = [...new Set(solicitudes.map(({ colectivoId }) => String(colectivoId)))];
    const nombres = await nombresDeColectivos(colectivoHttpClient, ids, options);
    return solicitudes
      .map((solicitud) => ({
        ...solicitud,
        colectivo: {
          id: String(solicitud.colectivoId),
          nombre: nombres.get(String(solicitud.colectivoId)),
        },
      }))
      .sort((a, b) => posicion(a) - posicion(b));
  };
}
