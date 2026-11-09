export function clases(...nombres) {
  return nombres.filter(Boolean).join(" ");
}
