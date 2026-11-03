/** JSON de backend, sin transformación ni métodos de dominio. */
export interface HabilidadDto {
  /** Identificador generado por backend a partir del título. */
  codigo: string;
  titulo: string;
  descripcion: string;
  /** Fecha ISO serializada por backend. */
  fechaCreacion: string;
  usuario: string;
  activo: boolean;
}
