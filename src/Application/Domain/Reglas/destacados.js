export const MAXIMO_DE_DESTACADOS = 6;
export const DIAS_POR_DEFECTO = 30;

const DIA_EN_ARGENTINA = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const FORMATO_DE_CAMPO = /^(\d{4})-(\d{2})-(\d{2})$/;

function sumarDias(dia, cantidad) {
  const [anio, mes, diaDelMes] = dia.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, diaDelMes + cantidad));
  return fecha.toISOString().slice(0, 10);
}

export function fechaDeFinPorDefecto(ahora = new Date()) {
  return sumarDias(DIA_EN_ARGENTINA.format(ahora), DIAS_POR_DEFECTO);
}

export function fechaMinimaDeFin(ahora = new Date()) {
  return sumarDias(DIA_EN_ARGENTINA.format(ahora), 1);
}

export function fechaDeFinValida(fecha, ahora = new Date()) {
  const partes = FORMATO_DE_CAMPO.exec(fecha ?? "");
  if (!partes) return false;
  const [, anio, mes, dia] = partes.map(Number);
  const real = new Date(Date.UTC(anio, mes - 1, dia));
  const existe =
    real.getUTCFullYear() === anio &&
    real.getUTCMonth() === mes - 1 &&
    real.getUTCDate() === dia;
  return existe && fecha >= fechaMinimaDeFin(ahora);
}

export function cupoCompleto(vigentes) {
  return vigentes >= MAXIMO_DE_DESTACADOS;
}

export function puedeCambiarDestacado(proyecto) {
  return proyecto?.conflictoDeIntereses !== true;
}
