export function informarFalla(contexto, error) {
  if (import.meta.env.DEV) console.error(`${contexto}:`, error);
}
