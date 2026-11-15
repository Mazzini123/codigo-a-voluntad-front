export function crearInvitarColaborador(httpClient) {
  return function invitarColaborador(proyectoId, perfilId, request, options = {}) {
    return httpClient.invitar(proyectoId, perfilId, request, options);
  };
}
