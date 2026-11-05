/**
 * Enviar al menos un campo. Las habilidades se gestionan por separado.
 * @typedef {Object} ActualizarPerfilRequest
 * @property {string} [descripcion]
 * @property {import('../App/CompromisoRequest.js').CompromisoRequest} [compromiso]
 * @property {import('../../Enums/MODALIDAD_COLABORACION.js').ModalidadColaboracion} [modalidadColaboracion]
 * @property {boolean} [busquedaAbierta]
 * @property {string|null} [fechaCierreBusqueda] Fecha ISO o datetime ISO con offset; null quita el cierre.
 * @property {number|null} [limiteColaboraciones] Entero positivo o null para no limitar.
 * @property {import('../../Enums/MODO_ACEPTACION.js').ModoAceptacion} [modoAceptacion]
 */
export {};
