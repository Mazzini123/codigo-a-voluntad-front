export function crearRegistrarUsuario(httpClient) {
  return function registrarUsuario(options = {}) {
    return httpClient.registrarUsuario(options);
  };
}
