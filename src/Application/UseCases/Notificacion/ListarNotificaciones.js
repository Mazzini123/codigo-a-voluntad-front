import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarNotificaciones(httpClient) {
  return async function listarNotificaciones(colaboradorId, query = {}, options = {}) {
    return aPagina(await httpClient.listar(colaboradorId, query, options));
  };
}
