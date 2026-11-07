import { crearObtenerCuentaActual } from "../../Application/UseCases/Auth/ObtenerCuentaActual.js";
import { crearAuthHttpClient } from "../../Infrastructure/HttpClients/AuthHttpClient.js";
import { axiosClient } from "../../Infrastructure/Http/axiosClient.js";
import {
  crearAuthHttpClientSimulado,
  leerSesionSimulada,
} from "../../Infrastructure/Auth/sesionSimulada.js";

/**
 * @param {import('axios').AxiosInstance} [http]
 * @param {import('../../Application/Domain/HttpClients/IAuthHttpClient.js').IAuthHttpClient} [httpClient]
 */
export function crearAuthDependencies(
  http = axiosClient,
  httpClient = crearAuthHttpClient(http),
) {
  return {
    obtenerCuentaActual: crearObtenerCuentaActual(httpClient),
  };
}

export const authDependencies = crearAuthDependencies(
  axiosClient,
  import.meta.env.DEV &&
    import.meta.env.MODE !== "test" &&
    leerSesionSimulada(import.meta.env.VITE_SESION_SIMULADA)
    ? crearAuthHttpClientSimulado(
        leerSesionSimulada(import.meta.env.VITE_SESION_SIMULADA),
        import.meta.env.VITE_SESION_SIMULADA_PERFIL_ID,
      )
    : undefined,
);
