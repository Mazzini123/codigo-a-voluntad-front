import axios from "axios";
import { crearBackendDemo } from "./crearBackendDemo.js";
import {
  recordarCuentaSimulada,
  recordarSesion,
} from "@/Infrastructure/Auth/sesionSimulada.js";

const CLAVE_ROL = "codigo-a-voluntad:demo:rol";

export function elegirRolDemo(rol) {
  sessionStorage.setItem(CLAVE_ROL, rol);
  recordarSesion(rol !== "VISITANTE");
  if (rol !== "VISITANTE")
    recordarCuentaSimulada(
      rol === "SIN_PERFIL" ? null : rol,
      rol === "COLECTIVO"
        ? "colectivo-simulado"
        : rol === "COLABORADORA"
          ? "colaboradora-simulada"
          : null,
    );
}

export function activarDemo(cliente) {
  if (!sessionStorage.getItem(CLAVE_ROL)) elegirRolDemo("COLECTIVO");
  const atender = crearBackendDemo(sessionStorage);
  cliente.defaults.adapter = async (config) => {
    if (config.signal?.aborted) throw new axios.CanceledError();
    const respuesta = await atender(config);
    if (respuesta.status >= 400)
      throw new axios.AxiosError(
        "Respuesta de la demo",
        "ERR_BAD_RESPONSE",
        config,
        null,
        respuesta,
      );
    return respuesta;
  };
}
