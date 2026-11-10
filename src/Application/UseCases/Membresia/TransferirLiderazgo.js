export function crearTransferirLiderazgo(httpClient) {
  return function transferirLiderazgo(colectivoId, contextoId, options = {}) {
    return httpClient.transferirLiderazgo(colectivoId, { contextoId }, options);
  };
}
