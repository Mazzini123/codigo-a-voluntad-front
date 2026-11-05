import { crearConsultarHealth } from "../../Application/UseCases/Health/ConsultarHealth.js";
import { crearHealthHttpClient } from "../../Infrastructure/HttpClients/HealthHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearHealthDependencies(http = axiosClient) {
  const httpClient = crearHealthHttpClient(http);
  return {
    consultarHealth: crearConsultarHealth(httpClient),
  };
}

export const healthDependencies = crearHealthDependencies();
