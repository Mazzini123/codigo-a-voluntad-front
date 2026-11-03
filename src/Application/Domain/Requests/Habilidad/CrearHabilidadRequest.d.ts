/** Body exacto de POST /habilidades. */
export interface CrearHabilidadRequest {
  /** Obligatorio, con contenido. */
  titulo: string;
  /** Por defecto cadena vacía. */
  descripcion?: string;
  /** Con contenido si se envía; backend usa admin por defecto. */
  usuario?: string;
}
