import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarAuditoria(httpClient) {
  return async function listarAuditoria(query = {}, options = {}) {
    return aPagina(await httpClient.listarAuditoria(query, options));
  };
}
