import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarRevisiones(httpClient) {
  return async function listarRevisiones(query = {}, options = {}) {
    return aPagina(await httpClient.listarRevisiones(query, options));
  };
}
