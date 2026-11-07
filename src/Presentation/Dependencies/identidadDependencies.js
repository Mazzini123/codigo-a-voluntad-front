import { crearIdentidad } from "../../Infrastructure/Auth/crearIdentidad.js";
import {
  crearIdentidadSimulada,
  leerSesionSimulada,
} from "../../Infrastructure/Auth/sesionSimulada.js";

export { SesionLogtoProvider } from "../../Infrastructure/Auth/SesionLogtoProvider.jsx";

export const configuracionLogto = {
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_RECURSO],
};

export { recordarVolverA, tomarVolverA } from "../../Infrastructure/Auth/volverA.js";
export { crearIdentidadFalsa } from "../../Infrastructure/Auth/crearIdentidadFalsa.js";

function crearIdentidadSimuladaConAviso(tipo) {
  console.warn(`Sesión simulada (${tipo}): no se usa Logto ni GET /auth/me.`);
  return crearIdentidadSimulada(tipo);
}

export const identidad =
  import.meta.env.DEV &&
  import.meta.env.MODE !== "test" &&
  leerSesionSimulada(import.meta.env.VITE_SESION_SIMULADA)
    ? crearIdentidadSimuladaConAviso(
        leerSesionSimulada(import.meta.env.VITE_SESION_SIMULADA),
      )
    : crearIdentidad(import.meta.env);
