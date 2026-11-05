/**
 * @typedef {Object} PerfilDto
 * @property {string} id
 * @property {string} descripcion
 * @property {import('./CompromisoDto.js').CompromisoDto} compromiso
 * @property {import('../Enums/MODALIDAD_COLABORACION.js').ModalidadColaboracion} modalidadColaboracion
 * @property {import('./HabilidadResumenDto.js').HabilidadResumenDto[]} habilidadesRequeridas
 * @property {import('./HabilidadResumenDto.js').HabilidadResumenDto[]} habilidadesOpcionales
 * @property {boolean} busquedaAbierta
 * @property {string|null} fechaCierreBusqueda Fecha ISO.
 * @property {number|null} limiteColaboraciones
 * @property {import('../Enums/MODO_ACEPTACION.js').ModoAceptacion} modoAceptacion
 */
export {};
