import { crearBuscarColaboradorasPotenciales } from "../../Application/UseCases/Reclutamiento/BuscarColaboradorasPotenciales.js";
import { crearBuscarProyectosPotenciales } from "../../Application/UseCases/Reclutamiento/BuscarProyectosPotenciales.js";
import { crearInvitarColaborador } from "../../Application/UseCases/Reclutamiento/InvitarColaborador.js";
import { crearReclutamientoHttpClient } from "../../Infrastructure/HttpClients/ReclutamientoHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearReclutamientoDependencies(http = axiosClient) {
  const httpClient = crearReclutamientoHttpClient(http);
  return {
    buscarColaboradorasPotenciales: crearBuscarColaboradorasPotenciales(httpClient),
    buscarProyectosPotenciales: crearBuscarProyectosPotenciales(httpClient),
    invitarColaborador: crearInvitarColaborador(httpClient),
  };
}

export const reclutamientoDependencies = crearReclutamientoDependencies();
