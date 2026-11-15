export function validarValoracion(puntaje, comentario) {
  if (!Number.isInteger(Number(puntaje)) || Number(puntaje) < 1 || Number(puntaje) > 5)
    return "Elegí un puntaje de 1 a 5.";
  if (comentario.trim().length > 280)
    return "El comentario puede tener hasta 280 caracteres.";
  return null;
}
