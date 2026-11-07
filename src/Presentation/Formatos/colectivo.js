export const TEXTO_TIPO_COLECTIVO = Object.freeze({
  FUNDACION: "Fundación",
  ASOCIACION_BARRIAL: "Asociación barrial",
  ONG: "ONG",
  ASAMBLEA: "Asamblea",
});

export const TEXTO_MEDIO_DE_CONTACTO = Object.freeze({
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
});

export function textoTipoColectivo(tipo) {
  return TEXTO_TIPO_COLECTIVO[tipo] ?? "";
}

export function textoUbicacion(ubicacion) {
  if (!ubicacion) return "";
  switch (ubicacion.tipoUbicacion) {
    case "ARGENTINA":
      return "Todo el país";
    case "CABA":
      return "Ciudad de Buenos Aires";
    default:
      return ubicacion.nombre ?? "";
  }
}
