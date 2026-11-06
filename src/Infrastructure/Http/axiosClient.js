import axios from 'axios';

// Instancia centralizada de Axios
export const axiosClient = axios.create({
  // Desarrollo: /api pasa por Vite.
  // Producción: URL pública o reverse proxy.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

let obtenerTokenFn = null;

export const configurarAuth = ({ obtenerToken }) => {
  obtenerTokenFn = obtenerToken;
};

axiosClient.interceptors.request.use(
  async (config) => {
    if (obtenerTokenFn) {
      try {
        const token = await obtenerTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error al obtener el token en axios:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);