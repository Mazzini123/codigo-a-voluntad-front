const NUMEROS_VISIBLES = 3;

export function numerosAlrededor(pagina, totalPaginas) {
  const cantidad = Math.min(NUMEROS_VISIBLES, totalPaginas);
  const primero = Math.max(1, Math.min(pagina - 1, totalPaginas - cantidad + 1));
  return Array.from({ length: cantidad }, (_, indice) => primero + indice);
}
