export function ruta(partes, ...valores) {
  return partes.reduce(
    (url, parte, indice) => url + encodeURIComponent(valores[indice - 1]) + parte,
  );
}

export function crearPedidos(http) {
  const datos = async (pedido) => (await pedido).data;
  return {
    get: (url, config) => datos(http.get(url, config)),
    delete: (url, config) => datos(http.delete(url, config)),
    post: (url, cuerpo, config) => datos(http.post(url, cuerpo, config)),
    put: (url, cuerpo, config) => datos(http.put(url, cuerpo, config)),
  };
}
