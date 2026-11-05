import { crearListarLogros } from "../../Application/UseCases/Logro/ListarLogros.js";
import { crearObtenerLogro } from "../../Application/UseCases/Logro/ObtenerLogro.js";
import { crearCrearLogro } from "../../Application/UseCases/Logro/CrearLogro.js";
import { crearActualizarLogro } from "../../Application/UseCases/Logro/ActualizarLogro.js";
import { crearEliminarLogro } from "../../Application/UseCases/Logro/EliminarLogro.js";
import { crearLogroHttpClient } from "../../Infrastructure/HttpClients/LogroHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearLogroDependencies(http = axiosClient) {
  const httpClient = crearLogroHttpClient(http);
  return {
    listarLogros: crearListarLogros(httpClient),
    obtenerLogro: crearObtenerLogro(httpClient),
    crearLogro: crearCrearLogro(httpClient),
    actualizarLogro: crearActualizarLogro(httpClient),
    eliminarLogro: crearEliminarLogro(httpClient),
  };
}

export const logroDependencies = crearLogroDependencies();
