import { crearValorarColaboracion } from "@/Application/UseCases/Valoracion/ValorarColaboracion.js";
import { crearObtenerValoracionesDeColectivo } from "@/Application/UseCases/Valoracion/ObtenerValoracionesDeColectivo.js";
import { crearObtenerValoracionesDeColaborador } from "@/Application/UseCases/Valoracion/ObtenerValoracionesDeColaborador.js";
import { crearValoracionHttpClient } from "@/Infrastructure/HttpClients/ValoracionHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearValoracionDependencies(http = axiosClient) {
  const httpClient = crearValoracionHttpClient(http);
  return {
    valorarColaboracion: crearValorarColaboracion(httpClient),
    obtenerValoracionesDeColectivo: crearObtenerValoracionesDeColectivo(httpClient),
    obtenerValoracionesDeColaborador: crearObtenerValoracionesDeColaborador(httpClient),
  };
}

export const valoracionDependencies = crearValoracionDependencies();
