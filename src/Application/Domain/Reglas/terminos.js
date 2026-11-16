export function hayTerminos(terminos) {
  return Boolean(terminos);
}

export function aceptacionPendiente(terminos, versionAceptada) {
  return hayTerminos(terminos) && versionAceptada !== terminos.version;
}

export function conTerminosAceptados(pedido, terminos) {
  if (!hayTerminos(terminos)) return pedido;
  return { ...pedido, terminosAceptados: terminos.version };
}
