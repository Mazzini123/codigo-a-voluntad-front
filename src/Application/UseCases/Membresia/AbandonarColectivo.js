export function crearAbandonarColectivo(httpClient) {
  return function abandonarColectivo(colectivoId, options = {}) {
    return httpClient.abandonar(colectivoId, options);
  };
}
