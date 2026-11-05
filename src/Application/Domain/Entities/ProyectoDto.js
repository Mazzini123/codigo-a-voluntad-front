/**
 * @typedef {Object} ProyectoDto
 * @property {string} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {import('../Enums/PROYECTO_ESTADO.js').ProyectoEstado} estado
 * @property {number} porcentajeConcrecion
 * @property {string|null} urlSistema
 * @property {string|null} urlRepositorio
 * @property {import('./PerfilDto.js').PerfilDto[]} perfiles
 * @property {import('./ColaboracionDto.js').ColaboracionDto[]} colaboraciones
 * @property {import('./LogroDto.js').LogroDto[]} logros
 * @property {import('./AvanceDto.js').AvanceDto[]} avances
 * @property {string[]} etiquetas
 * @property {import('../Enums/MODO_ACEPTACION.js').ModoAceptacion} modoAceptacion
 * @property {number|null} limiteVacantes
 * @property {number|null} vacantesLibres Campo calculado por backend.
 * @property {string} fechaCreacion
 * @property {string|null} fechaFinalizacion
 * @property {string|null} fechaCierre
 * @property {number} visualizaciones
 */
export {};
