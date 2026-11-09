import { PROVINCIAS } from "@/Application/Domain/Enums/PROVINCIAS.js";
import { TIPO_COLECTIVO } from "@/Application/Domain/Enums/TIPO_COLECTIVO.js";
import { TIPOS_MEDIOS_CONTACTO } from "@/Application/Domain/Enums/TIPOS_MEDIOS_CONTACTO.js";
import { TIPO_UBICACION } from "@/Application/Domain/Enums/TIPO_UBICACION.js";

export const TEXTO_TIPO_COLECTIVO = Object.freeze({
  [TIPO_COLECTIVO.FUNDACION]: "Fundación",
  [TIPO_COLECTIVO.ASOCIACION_BARRIAL]: "Asociación barrial",
  [TIPO_COLECTIVO.ONG]: "ONG",
  [TIPO_COLECTIVO.ASAMBLEA]: "Asamblea",
});

export const TEXTO_MEDIO_DE_CONTACTO = Object.freeze({
  [TIPOS_MEDIOS_CONTACTO.EMAIL]: "Email",
  [TIPOS_MEDIOS_CONTACTO.WHATSAPP]: "WhatsApp",
  [TIPOS_MEDIOS_CONTACTO.SMS]: "SMS",
});

export function textoTipoColectivo(tipo) {
  return TEXTO_TIPO_COLECTIVO[tipo] ?? "";
}

export function textoUbicacion(ubicacion) {
  if (!ubicacion) return "";
  switch (ubicacion.tipoUbicacion) {
    case TIPO_UBICACION.ARGENTINA:
      return "Todo el país";
    case TIPO_UBICACION.CABA:
      return "Ciudad de Buenos Aires";
    default:
      return ubicacion.nombre ?? "";
  }
}

export function sinTildes(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function opcionesDeProvincias(catalogo) {
  const nombres = catalogo?.length ? catalogo : PROVINCIAS;
  return nombres.map((nombre) => ({
    valor: sinTildes(nombre),
    texto:
      PROVINCIAS.find((provincia) => sinTildes(provincia) === sinTildes(nombre)) ??
      nombre,
  }));
}
