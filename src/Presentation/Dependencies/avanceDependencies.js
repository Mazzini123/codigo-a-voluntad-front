import { crearListarAvances } from "@/Application/UseCases/Avance/ListarAvances.js";
import { crearObtenerAvance } from "@/Application/UseCases/Avance/ObtenerAvance.js";
import { crearRegistrarAvance } from "@/Application/UseCases/Avance/RegistrarAvance.js";
import { crearAvanceHttpClient } from "@/Infrastructure/HttpClients/AvanceHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearAvanceDependencies(http = axiosClient) {
  const httpClient = crearAvanceHttpClient(http);
  return {
    listarAvances: crearListarAvances(httpClient),
    obtenerAvance: crearObtenerAvance(httpClient),
    registrarAvance: crearRegistrarAvance(httpClient),
  };
}

export const avanceDependencies = crearAvanceDependencies();
