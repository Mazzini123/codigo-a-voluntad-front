import { erroresDeListas, validarTexto } from "../Formulario/formulario.js";
import { IDENTIFICACION } from "./formularioColaboradora.js";

export const MAXIMO_PRONOMBRES = 5;
export const LARGO_PRONOMBRE = 20;

export function validarPronombre(texto, existentes) {
  return validarTexto(texto, existentes, {
    largoMaximo: LARGO_PRONOMBRE,
    mensajes: {
      vacio: "Escribí el pronombre antes de agregarlo.",
      largo: `Cada pronombre puede tener hasta ${LARGO_PRONOMBRE} caracteres.`,
      repetido: "Ese pronombre ya está agregado.",
    },
  });
}

export function validarColaboradora(estado, { esAlta }) {
  const errores = {};
  if (esAlta) {
    if (!estado.identificacion) errores.identificacion = "Elegí cómo querés que te vean.";
    if (
      estado.identificacion === IDENTIFICACION.FANTASIA &&
      !estado.nombreFantasia.trim()
    )
      errores.nombreFantasia = "Escribí tu nombre de fantasía.";
    if (estado.identificacion === IDENTIFICACION.NOMBRE) {
      if (!estado.nombre.trim()) errores.nombre = "Escribí tu nombre.";
      if (!estado.apellido.trim()) errores.apellido = "Escribí tu apellido.";
    }
    if (estado.habilidades.length === 0)
      errores.habilidades = "Elegí al menos una habilidad.";
  }
  return { ...errores, ...erroresDeListas(estado) };
}
