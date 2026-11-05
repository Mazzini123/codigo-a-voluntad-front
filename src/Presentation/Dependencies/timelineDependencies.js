import { crearObtenerTimelineDeColectivo } from "../../Application/UseCases/Timeline/ObtenerTimelineDeColectivo.js";
import { crearTimelineHttpClient } from "../../Infrastructure/HttpClients/TimelineHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";

/** @param {import('axios').AxiosInstance} [http] */
export function crearTimelineDependencies(http = axiosClient) {
  const httpClient = crearTimelineHttpClient(http);
  return {
    obtenerTimelineDeColectivo: crearObtenerTimelineDeColectivo(httpClient),
  };
}

export const timelineDependencies = crearTimelineDependencies();
