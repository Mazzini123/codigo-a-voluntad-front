import { crearListarNotificaciones } from "@/Application/UseCases/Notificacion/ListarNotificaciones.js";
import { crearMarcarNotificacionComoLeida } from "@/Application/UseCases/Notificacion/MarcarNotificacionComoLeida.js";
import { crearNotificacionHttpClient } from "@/Infrastructure/HttpClients/NotificacionHttpClient.js";
import { axiosClient } from "@/Infrastructure/Http/axiosClient.js";

export function crearNotificacionDependencies(http = axiosClient) {
  const httpClient = crearNotificacionHttpClient(http);
  return {
    listarNotificaciones: crearListarNotificaciones(httpClient),
    marcarNotificacionComoLeida: crearMarcarNotificacionComoLeida(httpClient),
  };
}

export const notificacionDependencies = crearNotificacionDependencies();
