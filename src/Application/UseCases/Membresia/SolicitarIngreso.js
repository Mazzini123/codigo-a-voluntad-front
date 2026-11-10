export function crearSolicitarIngreso(httpClient) {
  return function solicitarIngreso(colectivoId, options = {}) {
    return httpClient.solicitarIngreso(colectivoId, options);
  };
}
