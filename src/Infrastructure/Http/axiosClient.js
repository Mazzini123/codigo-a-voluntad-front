import axios from "axios";

// Desarrollo: /api pasa por Vite. Producción: URL pública o reverse proxy.
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: { Accept: "application/json" },
});
