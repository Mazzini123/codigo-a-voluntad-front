import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarColaboradores(httpClient) {
  return async function listarColaboradores(query = {}, options = {}) {
    return aPagina(await httpClient.listar(query, options));
  };
}
