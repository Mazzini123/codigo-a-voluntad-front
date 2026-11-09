import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarHabilidades(httpClient) {
  return async function listarHabilidades(query = {}, options = {}) {
    return aPagina(await httpClient.listar(query, options));
  };
}
