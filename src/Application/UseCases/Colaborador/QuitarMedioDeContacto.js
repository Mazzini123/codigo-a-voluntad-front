export function crearQuitarMedioDeContacto(httpClient) {
  return function quitarMedioDeContacto(colaboradorId, tipo, valor, options = {}) {
    return httpClient.quitarMedioDeContacto(colaboradorId, tipo, valor, options);
  };
}
