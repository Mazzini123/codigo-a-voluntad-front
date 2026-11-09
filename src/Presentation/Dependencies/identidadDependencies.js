import {
  elegirProveedorDeIdentidad,
  PROVEEDOR_DE_IDENTIDAD,
} from "@/Infrastructure/Auth/elegirProveedorDeIdentidad.js";

export { ProveedorDeSesionLogto } from "@/Infrastructure/Auth/ProveedorDeSesionLogto.jsx";

export const configuracionLogto = {
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_RECURSO],
};

export { recordarVolverA, tomarVolverA } from "@/Infrastructure/Auth/volverA.js";
export { crearIdentidadFalsa } from "@/Infrastructure/Auth/crearIdentidadFalsa.js";

export { PROVEEDOR_DE_IDENTIDAD };

export const proveedorDeIdentidad = elegirProveedorDeIdentidad(import.meta.env);
