import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarProyectos(httpClient) {
  return async function listarProyectos(query = {}, options = {}) {
    return aPagina(await httpClient.listar(query, options));
  };
}
