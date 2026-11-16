export const ERROR_NOTA_OBLIGATORIA =
  "Escribí qué tiene que cambiar el colectivo: es lo único que va a ver para corregir el proyecto.";

export function errorDeNota(nota, { obligatoria = false } = {}) {
  if (!obligatoria) return null;
  return nota.trim() ? null : ERROR_NOTA_OBLIGATORIA;
}
