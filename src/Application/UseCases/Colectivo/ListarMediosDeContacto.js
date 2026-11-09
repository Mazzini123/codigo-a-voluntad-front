export function crearListarMediosDeContacto(httpClient) {
  return async function listarMediosDeContacto(colectivoId, options = {}) {
    const medios = await httpClient.listarMediosDeContacto(colectivoId, options);
    return Array.isArray(medios) ? medios : [];
  };
}
