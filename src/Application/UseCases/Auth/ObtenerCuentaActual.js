import { aCuenta } from "@/Application/Adaptadores/aCuenta.js";

export function crearObtenerCuentaActual(httpClient) {
  return async function obtenerCuentaActual(options = {}) {
    return aCuenta(await httpClient.obtenerCuentaActual(options));
  };
}
