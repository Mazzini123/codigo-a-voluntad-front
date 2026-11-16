export function crearDarDeBajaColectivo(httpClient) {
  return function darDeBajaColectivo(colectivoId, motivo, options = {}) {
    return httpClient.darDeBajaColectivo(colectivoId, { motivo: motivo.trim() }, options);
  };
}
