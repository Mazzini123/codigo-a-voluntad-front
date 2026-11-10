export const LARGO_MAXIMO_DEL_NOMBRE = 80;

export function validarNombreDeUsuario(texto) {
  const nombre = texto.trim();
  if (!nombre) return "Escribí tu nombre.";
  if (nombre.length > LARGO_MAXIMO_DEL_NOMBRE) {
    return `Usá como máximo ${LARGO_MAXIMO_DEL_NOMBRE} caracteres.`;
  }
  return null;
}
