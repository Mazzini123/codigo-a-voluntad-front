const formato = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

export function numeroEstadistico(valor) {
  return formato.format(valor ?? 0);
}

export function hayActividad(datos) {
  return [
    datos.colectivos.total,
    datos.proyectos.total,
    datos.colaboradores.total,
    datos.colaboraciones.total,
  ].some((valor) => valor > 0);
}
