import { crearListarProyectos } from "../../Application/UseCases/Proyecto/ListarProyectos.js";
import { crearObtenerProyecto } from "../../Application/UseCases/Proyecto/ObtenerProyecto.js";
import { crearCrearProyecto } from "../../Application/UseCases/Proyecto/CrearProyecto.js";
import { crearListarProyectosDeColectivo } from "../../Application/UseCases/Proyecto/ListarProyectosDeColectivo.js";
import { crearActualizarProyecto } from "../../Application/UseCases/Proyecto/ActualizarProyecto.js";
import { crearFinalizarProyecto } from "../../Application/UseCases/Proyecto/FinalizarProyecto.js";
import { crearProyectoHttpClient } from "../../Infrastructure/HttpClients/ProyectoHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearProyectoDependencies(http = axiosClient) {
  const httpClient = crearProyectoHttpClient(http);
  return {
    listarProyectos: crearListarProyectos(httpClient),
    obtenerProyecto: crearObtenerProyecto(httpClient),
    crearProyecto: crearCrearProyecto(httpClient),
    listarProyectosDeColectivo: crearListarProyectosDeColectivo(httpClient),
    actualizarProyecto: crearActualizarProyecto(httpClient),
    finalizarProyecto: crearFinalizarProyecto(httpClient),
  };
}

export const proyectoDependencies = crearProyectoDependencies();
