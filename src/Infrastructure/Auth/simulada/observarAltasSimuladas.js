import { recordarCuentaSimulada } from "../sesionSimulada.js";

// Solo se instala al componer el adaptador simulado. El proveedor de identidad
// no participa del alta: la cuenta adopta el perfil confirmado por el backend.
export function observarAltasSimuladas(http) {
  const interceptor = http.interceptors.response.use((respuesta) => {
    const { config, status, data } = respuesta;
    const rol = {
      "/colectivos": "COLECTIVO",
      "/colaboradores": "COLABORADORA",
    }[config.url];
    if (config.method === "post" && status === 201 && data?.id && rol) {
      recordarCuentaSimulada(rol, data.id);
    }
    return respuesta;
  });
  return () => http.interceptors.response.eject(interceptor);
}
