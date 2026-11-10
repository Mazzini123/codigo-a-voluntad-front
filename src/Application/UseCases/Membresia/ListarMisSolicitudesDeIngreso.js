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

export function crearListarMisSolicitudesDeIngreso(httpClient) {
  return async function listarMisSolicitudesDeIngreso(options = {}) {
    const solicitudes = await httpClient.listarMisSolicitudes(options);
    return [...(solicitudes ?? [])].sort((a, b) => posicion(a) - posicion(b));
  };
}
