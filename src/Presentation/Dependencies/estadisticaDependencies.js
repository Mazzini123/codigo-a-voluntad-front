import { crearObtenerEstadisticasGlobales } from "@/Application/UseCases/Estadistica/ObtenerEstadisticasGlobales.js";
import { crearObtenerEstadisticasDeColectivo } from "@/Application/UseCases/Estadistica/ObtenerEstadisticasDeColectivo.js";
import { crearEstadisticaHttpClient } from "@/Infrastructure/HttpClients/EstadisticaHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearEstadisticaDependencies(http = axiosClient) {
  const httpClient = crearEstadisticaHttpClient(http);
  return {
    obtenerEstadisticasGlobales: crearObtenerEstadisticasGlobales(httpClient),
    obtenerEstadisticasDeColectivo: crearObtenerEstadisticasDeColectivo(httpClient),
  };
}

export const estadisticaDependencies = crearEstadisticaDependencies();
