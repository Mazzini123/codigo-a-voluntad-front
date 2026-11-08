import { RUTA_CALLBACK } from '../authRoutes';

export const logtoConfig = {
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_API_RESOURCE],
};

export const urlDeCallback = `${window.location.origin}${RUTA_CALLBACK}`;
export const urlDeSalida = window.location.origin;