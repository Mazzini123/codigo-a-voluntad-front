export function crearListarProyectosDestacados(httpClient) {
  return async function listarProyectosDestacados(options = {}) {
    const cuerpo = await httpClient.listarDestacados(options);
    return Array.isArray(cuerpo) ? cuerpo : [];
  };
}
