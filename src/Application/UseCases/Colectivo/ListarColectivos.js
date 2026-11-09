import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarColectivos(httpClient) {
  return async function listarColectivos(query = {}, options = {}) {
    return aPagina(await httpClient.listar(query, options));
  };
}
