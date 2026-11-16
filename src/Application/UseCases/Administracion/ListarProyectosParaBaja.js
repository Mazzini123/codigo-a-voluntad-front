import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearListarProyectosParaBaja(httpClient) {
  return async function listarProyectosParaBaja(query = {}, options = {}) {
    return aPagina(await httpClient.listarProyectos(query, options));
  };
}
