export function crearQuitarMedioDeContacto(httpClient) {
  return function quitarMedioDeContacto(colectivoId, tipo, valor, options = {}) {
    return httpClient.quitarMedioDeContacto(colectivoId, tipo, valor, options);
  };
}
