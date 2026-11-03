/** Query params de backend (limit, no per_page). */
export interface PaginacionRequest {
  /** Entero positivo; por defecto 1. */
  page?: number;
  /** Entre 1 y 100; por defecto 10. */
  limit?: number;
}
