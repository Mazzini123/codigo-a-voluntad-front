import {
  erroresDeListas,
  validarTexto,
} from "@/Presentation/Formularios/comunes/formulario.js";
import { IDENTIFICACION } from "./formularioColaboradora.js";

export const MAXIMO_PRONOMBRES = 5;
export const LARGO_PRONOMBRE = 20;
export const LARGO_NOMBRE = 50;
export const LARGO_PRESENTACION = 1000;
export const USUARIO_DE_GIT = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;

function validarLargo(errores, clave, valor, maximo, texto) {
  if (valor.trim().length > maximo)
    errores[clave] = `${texto} puede tener hasta ${maximo} caracteres.`;
}

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
  validarLargo(
    errores,
    "nombreFantasia",
    estado.nombreFantasia,
    LARGO_NOMBRE,
    "El nombre de fantasía",
  );
  validarLargo(errores, "nombre", estado.nombre, LARGO_NOMBRE, "El nombre");
  validarLargo(errores, "apellido", estado.apellido, LARGO_NOMBRE, "El apellido");
  validarLargo(
    errores,
    "presentacion",
    estado.presentacion,
    LARGO_PRESENTACION,
    "La presentación",
  );
  if (esAlta && estado.cuentaGit.trim() && !USUARIO_DE_GIT.test(estado.cuentaGit.trim()))
    errores.cuentaGit =
      "Escribí solo tu usuario, sin la dirección ni espacios. Por ejemplo: mi-usuario.";
  return { ...errores, ...erroresDeListas(estado) };
}
