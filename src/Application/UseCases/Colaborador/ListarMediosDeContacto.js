export function crearListarMediosDeContacto(httpClient) {
  return async function listarMediosDeContacto(colaboradorId, options = {}) {
    const medios = await httpClient.listarMediosDeContacto(colaboradorId, options);
    return Array.isArray(medios) ? medios : [];
  };
}
