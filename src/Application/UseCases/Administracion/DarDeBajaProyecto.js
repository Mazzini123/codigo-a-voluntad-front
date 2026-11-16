export function crearDarDeBajaProyecto(httpClient) {
  return function darDeBajaProyecto(proyectoId, motivo, options = {}) {
    return httpClient.darDeBajaProyecto(proyectoId, { motivo: motivo.trim() }, options);
  };
}
