import { ESTADO_SOLICITUD } from "@/Application/Domain/Enums/ESTADO_SOLICITUD.js";

export function crearListarColectivosConSolicitudPendiente(httpClient) {
  return async function listarColectivosConSolicitudPendiente(options = {}) {
    const solicitudes = await httpClient.listarMisSolicitudes(options);
    if (!Array.isArray(solicitudes)) return [];
    const ids = solicitudes
      .filter(({ estado }) => estado === ESTADO_SOLICITUD.PENDIENTE)
      .map(({ colectivoId }) => String(colectivoId));
    return [...new Set(ids)];
  };
}
