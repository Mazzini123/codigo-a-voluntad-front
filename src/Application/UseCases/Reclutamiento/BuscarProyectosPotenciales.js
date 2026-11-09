import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearBuscarProyectosPotenciales(httpClient) {
  return async function buscarProyectosPotenciales(
    colaboradorId,
    query = {},
    options = {},
  ) {
    return aPagina(await httpClient.buscarProyectos(colaboradorId, query, options));
  };
}
