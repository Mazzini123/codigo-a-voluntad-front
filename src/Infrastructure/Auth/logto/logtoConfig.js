export const logtoConfig = {
  endpoint: import.meta.env.VITE_LOGTO_ENDPOINT,
  appId: import.meta.env.VITE_LOGTO_APP_ID,
  resources: [import.meta.env.VITE_LOGTO_API_RESOURCE],
};

export const urlDeCallback = `${window.location.origin}/logto/callback`;
export const urlDeSalida = window.location.origin;