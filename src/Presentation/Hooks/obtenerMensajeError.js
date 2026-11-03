// Sólo decide el texto de presentación; el resto de las capas propaga el error.
export function obtenerMensajeError(error) {
  return (
    error.response?.data?.message ||
    "No se pudo completar la operación. Revisá la conexión con el backend."
  );
}
