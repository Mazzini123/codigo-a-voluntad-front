import { crearObtenerCuentaActual } from "@/Application/UseCases/Auth/ObtenerCuentaActual.js";
import { crearRegistrarUsuario } from "@/Application/UseCases/Auth/RegistrarUsuario.js";
import { crearCambiarNombreDeUsuario } from "@/Application/UseCases/Auth/CambiarNombreDeUsuario.js";
import { crearSeleccionarContexto } from "@/Application/UseCases/Auth/SeleccionarContexto.js";
import { crearLimpiarContexto } from "@/Application/UseCases/Auth/LimpiarContexto.js";
import { crearAuthHttpClient } from "@/Infrastructure/HttpClients/AuthHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";
import { observarAltasSimuladas } from "@/Infrastructure/Auth/simulada/observarAltasSimuladas.js";
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
    registrarUsuario: crearRegistrarUsuario(httpClient),
    cambiarNombreDeUsuario: crearCambiarNombreDeUsuario(httpClient),
    seleccionarContexto: crearSeleccionarContexto(httpClient),
    limpiarContexto: crearLimpiarContexto(httpClient),
  };
}

const simulada = sesionSimuladaActiva(import.meta.env);
if (simulada) observarAltasSimuladas(axiosClient);

export const authDependencies = crearAuthDependencies(
  axiosClient,
  simulada
    ? crearAuthHttpClientSimulado(
        simulada,
        import.meta.env.VITE_SESION_SIMULADA_PERFIL_ID,
      )
    : undefined,
);
