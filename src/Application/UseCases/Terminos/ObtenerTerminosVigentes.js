const SIN_TERMINOS = 404;

export function crearObtenerTerminosVigentes(httpClient) {
  return async function obtenerTerminosVigentes(options = {}) {
    try {
      return await httpClient.obtenerVigentes(options);
    } catch (error) {
      if (error?.status === SIN_TERMINOS) return null;
      throw error;
    }
  };
}
