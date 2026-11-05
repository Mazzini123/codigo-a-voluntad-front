/**
 * @typedef {Object} CrearPerfilRequest
 * @property {string} descripcion
 * @property {string[]} codigosHabilidadesRequeridas Al menos una.
 * @property {string[]} [codigosHabilidadesOpcionales]
 * @property {import('../App/CompromisoRequest.js').CompromisoRequest} compromiso
 * @property {import('../../Enums/MODALIDAD_COLABORACION.js').ModalidadColaboracion} [modalidadColaboracion]
 * @property {boolean} [busquedaAbierta] Por defecto true.
 * @property {string|null} [fechaCierreBusqueda] Fecha ISO o datetime ISO con offset; null quita el cierre.
 * @property {number|null} [limiteColaboraciones] Entero positivo o null para no limitar.
 * @property {import('../../Enums/MODO_ACEPTACION.js').ModoAceptacion} [modoAceptacion] Por defecto REVISION_MANUAL.
 */
export {};
