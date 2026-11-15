export function crearQuitarMiembro(httpClient) {
  return function quitarMiembro(colectivoId, contextoId, options = {}) {
    return httpClient.quitarMiembro(colectivoId, contextoId, options);
  };
}
