/**
 * El colectivoId va en la URL, no en el body.
 * @typedef {Object} CrearProyectoRequest
 * @property {string} titulo
 * @property {string} descripcion
 * @property {import('../Perfil/CrearPerfilRequest.js').CrearPerfilRequest[]} perfiles Al menos un perfil.
 * @property {string[]} [etiquetas]
 * @property {import('../../Enums/MODO_ACEPTACION.js').ModoAceptacion} [modoAceptacion]
 * @property {number|null} [limiteVacantes] Entero positivo o null.
 * @property {string|null} [fechaCierre] Fecha ISO o datetime ISO con offset; null elimina el cierre.
 */
export {};
