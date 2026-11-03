import { crearListarHabilidades } from "../../Application/UseCases/Habilidad/ListarHabilidades.js";
import { crearCrearHabilidad } from "../../Application/UseCases/Habilidad/CrearHabilidad.js";
import { crearHabilidadHttpClient } from "../../Infrastructure/HttpClients/HabilidadHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

const httpClient = crearHabilidadHttpClient(axiosClient);
export const habilidadDependencies = {
  listarHabilidades: crearListarHabilidades(httpClient),
  crearHabilidad: crearCrearHabilidad(httpClient),
};
