export function crearCambiarNombreDeUsuario(httpClient) {
  return function cambiarNombreDeUsuario(nombre, options = {}) {
    return httpClient.cambiarNombre({ nombre: nombre.trim() }, options);
  };
}
