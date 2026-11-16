export function crearPublicarTerminos(httpClient) {
  return function publicarTerminos(texto, options = {}) {
    return httpClient.publicarTerminos({ texto: texto.trim() }, options);
  };
}
