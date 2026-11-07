/**
 * @param {{ autenticado?: boolean, token?: string | null }} [estadoInicial]
 * @returns {import('./identidad.js').Identidad & { inicios: object[], salidas: number }}
 */
export function crearIdentidadFalsa({
  autenticado = false,
  token = "token-de-prueba",
} = {}) {
  let conSesion = autenticado;
  const identidad = {
    inicios: [],
    salidas: 0,
    estaAutenticado: async () => conSesion,
    async iniciarSesion(opciones = {}) {
      identidad.inicios.push(opciones);
    },
    async completarIngreso() {
      conSesion = true;
    },
    obtenerToken: async () => (conSesion ? token : null),
    async cerrarSesion() {
      identidad.salidas += 1;
      conSesion = false;
    },
    async olvidarSesion() {
      conSesion = false;
    },
  };
  return identidad;
}
