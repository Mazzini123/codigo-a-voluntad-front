import { crearListarHabilidades } from "@/Application/UseCases/Habilidad/ListarHabilidades.js";
import { crearCrearHabilidad } from "@/Application/UseCases/Habilidad/CrearHabilidad.js";
import { crearHabilidadHttpClient } from "@/Infrastructure/HttpClients/HabilidadHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearHabilidadDependencies(http = axiosClient) {
  const httpClient = crearHabilidadHttpClient(http);
  return {
    listarHabilidades: crearListarHabilidades(httpClient),
    crearHabilidad: crearCrearHabilidad(httpClient),
  };
}

export const habilidadDependencies = crearHabilidadDependencies();
