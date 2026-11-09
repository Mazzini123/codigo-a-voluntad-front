export function crearDarDeBajaColectivo(httpClient) {
  return function darDeBajaColectivo(colectivoId, options = {}) {
    return httpClient.darDeBaja(colectivoId, options);
  };
}
