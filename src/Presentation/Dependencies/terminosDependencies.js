import { crearObtenerTerminosVigentes } from "@/Application/UseCases/Terminos/ObtenerTerminosVigentes.js";
import { crearTerminosHttpClient } from "@/Infrastructure/HttpClients/TerminosHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearTerminosDependencies(http = axiosClient) {
  const httpClient = crearTerminosHttpClient(http);
  return {
    obtenerTerminosVigentes: crearObtenerTerminosVigentes(httpClient),
  };
}

export const terminosDependencies = crearTerminosDependencies();
