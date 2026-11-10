import { crearListarMiembros } from "@/Application/UseCases/Membresia/ListarMiembros.js";
import { crearQuitarMiembro } from "@/Application/UseCases/Membresia/QuitarMiembro.js";
import { crearAbandonarColectivo } from "@/Application/UseCases/Membresia/AbandonarColectivo.js";
import { crearTransferirLiderazgo } from "@/Application/UseCases/Membresia/TransferirLiderazgo.js";
import { crearListarSolicitudesDeIngreso } from "@/Application/UseCases/Membresia/ListarSolicitudesDeIngreso.js";
import { crearAceptarSolicitudDeIngreso } from "@/Application/UseCases/Membresia/AceptarSolicitudDeIngreso.js";
import { crearRechazarSolicitudDeIngreso } from "@/Application/UseCases/Membresia/RechazarSolicitudDeIngreso.js";
import { crearSolicitarIngreso } from "@/Application/UseCases/Membresia/SolicitarIngreso.js";
import { crearCancelarSolicitudDeIngreso } from "@/Application/UseCases/Membresia/CancelarSolicitudDeIngreso.js";
import { crearListarMisSolicitudesDeIngreso } from "@/Application/UseCases/Membresia/ListarMisSolicitudesDeIngreso.js";
import { crearColectivoHttpClient } from "@/Infrastructure/HttpClients/ColectivoHttpClient.js";
import { crearMembresiaHttpClient } from "@/Infrastructure/HttpClients/MembresiaHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearMembresiaDependencies(http = axiosClient) {
  const httpClient = crearMembresiaHttpClient(http);
  const colectivoHttpClient = crearColectivoHttpClient(http);
  return {
    listarMiembros: crearListarMiembros(httpClient),
    quitarMiembro: crearQuitarMiembro(httpClient),
    abandonarColectivo: crearAbandonarColectivo(httpClient),
    transferirLiderazgo: crearTransferirLiderazgo(httpClient),
    listarSolicitudesDeIngreso: crearListarSolicitudesDeIngreso(httpClient),
    aceptarSolicitudDeIngreso: crearAceptarSolicitudDeIngreso(httpClient),
    rechazarSolicitudDeIngreso: crearRechazarSolicitudDeIngreso(httpClient),
    solicitarIngreso: crearSolicitarIngreso(httpClient),
    cancelarSolicitudDeIngreso: crearCancelarSolicitudDeIngreso(httpClient),
    listarMisSolicitudesDeIngreso: crearListarMisSolicitudesDeIngreso(
      httpClient,
      colectivoHttpClient,
    ),
  };
}

export const membresiaDependencies = crearMembresiaDependencies();
