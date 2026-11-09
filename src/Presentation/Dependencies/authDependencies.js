import { crearObtenerCuentaActual } from "@/Application/UseCases/Auth/ObtenerCuentaActual.js";
import { crearAuthHttpClient } from "@/Infrastructure/HttpClients/AuthHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import {
  crearAuthHttpClientSimulado,
  sesionSimuladaActiva,
} from "@/Infrastructure/Auth/sesionSimulada.js";

export function crearAuthDependencies(
  http = axiosClient,
  httpClient = crearAuthHttpClient(http),
) {
  return {
    obtenerCuentaActual: crearObtenerCuentaActual(httpClient),
  };
}

const simulada = sesionSimuladaActiva(import.meta.env);

export const authDependencies = crearAuthDependencies(
  axiosClient,
  simulada
    ? crearAuthHttpClientSimulado(
        simulada,
        import.meta.env.VITE_SESION_SIMULADA_PERFIL_ID,
      )
    : undefined,
);
