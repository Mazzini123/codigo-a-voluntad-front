import { obtenerConfiguracionAuth } from "@/Infrastructure/Auth/authFactory.js";

export { crearSesionFalsa } from "@/Infrastructure/Auth/crearSesionFalsa.js";
export { recordarVolverA, tomarVolverA } from "@/Infrastructure/Auth/volverA.js";

export const configuracionAuth = obtenerConfiguracionAuth();
export const ProveedorAuth = configuracionAuth.Provider;
