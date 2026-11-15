export const PASO_DE_REGISTRO = Object.freeze({
  NOMBRE: "NOMBRE",
  MODALIDAD: "MODALIDAD",
  ESPERA: "ESPERA",
  COMPLETO: "COMPLETO",
});

export function tieneModalidad(cuenta) {
  return Boolean(cuenta?.rol) || (cuenta?.contextos ?? []).length > 0;
}

export function necesitaPedidosPendientes(cuenta) {
  return Boolean(cuenta) && !cuenta.nombrePendiente && !tieneModalidad(cuenta);
}

export function tienePedidoPendiente(cuenta) {
  return (cuenta?.pedidosPendientes ?? []).length > 0;
}

export function pasoDeRegistro(cuenta) {
  if (!cuenta) return null;
  if (cuenta.nombrePendiente) return PASO_DE_REGISTRO.NOMBRE;
  if (tieneModalidad(cuenta)) return PASO_DE_REGISTRO.COMPLETO;
  return tienePedidoPendiente(cuenta)
    ? PASO_DE_REGISTRO.ESPERA
    : PASO_DE_REGISTRO.MODALIDAD;
}

export function registroIncompleto(cuenta) {
  const paso = pasoDeRegistro(cuenta);
  return paso !== null && paso !== PASO_DE_REGISTRO.COMPLETO;
}

export function esperandoIngreso(cuenta) {
  return pasoDeRegistro(cuenta) === PASO_DE_REGISTRO.ESPERA;
}

export function contextoParaRetomar(cuenta) {
  if (!cuenta || cuenta.nombrePendiente || cuenta.contextoActual) return null;
  const contextos = cuenta.contextos ?? [];
  return contextos.length === 1 ? contextos[0] : null;
}
