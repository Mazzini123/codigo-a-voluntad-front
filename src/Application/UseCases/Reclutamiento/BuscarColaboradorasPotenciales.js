import { aPagina } from "@/Application/Adaptadores/aPagina.js";

export function crearBuscarColaboradorasPotenciales(httpClient) {
  return async function buscarColaboradorasPotenciales(
    proyectoId,
    perfilId,
    query = {},
    options = {},
  ) {
    return aPagina(
      await httpClient.buscarColaboradoras(proyectoId, perfilId, query, options),
    );
  };
}
