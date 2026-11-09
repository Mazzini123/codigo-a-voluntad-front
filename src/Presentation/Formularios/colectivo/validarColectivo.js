import {
  erroresDeListas,
  validarTexto,
} from "@/Presentation/Formularios/comunes/formulario.js";
import { OPCION_UBICACION } from "./formularioColectivo.js";

export const LARGO_ETIQUETA = 30;

export function validarEtiqueta(texto, existentes) {
  return validarTexto(texto, existentes, {
    largoMaximo: LARGO_ETIQUETA,
    mensajes: {
      vacio: "Escribí la etiqueta antes de agregarla.",
      largo: `La etiqueta puede tener hasta ${LARGO_ETIQUETA} caracteres.`,
      repetido: "Esa etiqueta ya está agregada.",
    },
  });
}

export function validarColectivo(estado, { esAlta }) {
  const errores = {};
  if (!estado.nombre.trim()) errores.nombre = "Escribí el nombre del colectivo.";
  if (esAlta && !estado.tipoColectivo)
    errores.tipoColectivo = "Elegí el tipo de colectivo.";
  if (!estado.descripcion.trim())
    errores.descripcion = "Contá en pocas líneas a qué se dedican.";

  const { opcion, provincia, localidad } = estado.ubicacion;
  if (opcion === OPCION_UBICACION.PROVINCIA && !provincia)
    errores["ubicacion.provincia"] = "Elegí la provincia.";
  if (opcion === OPCION_UBICACION.LOCALIDAD && !localidad.trim())
    errores["ubicacion.localidad"] = "Escribí la ciudad o el barrio.";

  return { ...errores, ...erroresDeListas(estado) };
}
