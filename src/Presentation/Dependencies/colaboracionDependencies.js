import { crearRegistrarColaboracion } from "../../Application/UseCases/Colaboracion/RegistrarColaboracion.js";
import { crearListarColaboracionesDeProyecto } from "../../Application/UseCases/Colaboracion/ListarColaboracionesDeProyecto.js";
import { crearListarColaboracionesDeColaborador } from "../../Application/UseCases/Colaboracion/ListarColaboracionesDeColaborador.js";
import { crearAceptarPostulacion } from "../../Application/UseCases/Colaboracion/AceptarPostulacion.js";
import { crearRechazarPostulacion } from "../../Application/UseCases/Colaboracion/RechazarPostulacion.js";
import { crearFinalizarColaboracion } from "../../Application/UseCases/Colaboracion/FinalizarColaboracion.js";
import { crearDesvincularColaboracion } from "../../Application/UseCases/Colaboracion/DesvincularColaboracion.js";
import { crearColaboracionHttpClient } from "../../Infrastructure/HttpClients/ColaboracionHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearColaboracionDependencies(http = axiosClient) {
  const httpClient = crearColaboracionHttpClient(http);
  return {
    registrarColaboracion: crearRegistrarColaboracion(httpClient),
    listarColaboracionesDeProyecto: crearListarColaboracionesDeProyecto(httpClient),
    listarColaboracionesDeColaborador: crearListarColaboracionesDeColaborador(httpClient),
    aceptarPostulacion: crearAceptarPostulacion(httpClient),
    rechazarPostulacion: crearRechazarPostulacion(httpClient),
    finalizarColaboracion: crearFinalizarColaboracion(httpClient),
    desvincularColaboracion: crearDesvincularColaboracion(httpClient),
  };
}

export const colaboracionDependencies = crearColaboracionDependencies();
