export function crearListarProvincias(httpClient) {
  return async function listarProvincias(options = {}) {
    const provincias = await httpClient.listarProvincias(options);
    return Array.isArray(provincias) ? provincias : [];
  };
}
