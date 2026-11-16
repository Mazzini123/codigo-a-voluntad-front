export function crearListarDestacadosDeAdministracion(httpClient) {
  return async function listarDestacadosDeAdministracion(options = {}) {
    const cuerpo = await httpClient.listarDestacados(options);
    return Array.isArray(cuerpo) ? cuerpo : [];
  };
}
