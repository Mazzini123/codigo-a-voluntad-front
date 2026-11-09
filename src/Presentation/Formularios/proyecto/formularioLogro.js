export const LARGO_MAXIMO_TITULO_DE_LOGRO = 100;
export const LARGO_MAXIMO_DESCRIPCION_DE_LOGRO = 1000;

export const LOGRO_VACIO = Object.freeze({ titulo: "", descripcion: "" });

export function estadoInicialDeLogro(logro) {
  if (!logro) return LOGRO_VACIO;
  return { titulo: logro.titulo ?? "", descripcion: logro.descripcion ?? "" };
}

export function validarLogro({ titulo, descripcion }) {
  const errores = {};
  if (!titulo.trim()) errores.titulo = "Escribí el título del logro.";
  else if (titulo.trim().length > LARGO_MAXIMO_TITULO_DE_LOGRO)
    errores.titulo = `El título puede tener hasta ${LARGO_MAXIMO_TITULO_DE_LOGRO} caracteres.`;
  if (!descripcion.trim()) errores.descripcion = "Contá en qué consistió el logro.";
  else if (descripcion.trim().length > LARGO_MAXIMO_DESCRIPCION_DE_LOGRO)
    errores.descripcion = `La descripción puede tener hasta ${LARGO_MAXIMO_DESCRIPCION_DE_LOGRO} caracteres.`;
  return errores;
}

export function armarLogro({ titulo, descripcion }) {
  return { titulo: titulo.trim(), descripcion: descripcion.trim() };
}
