/**
 * @typedef {Object} ColaboracionDto
 * @property {string} id
 * @property {string} perfil Identificador del perfil al que se postuló; no es un PerfilDto.
 * @property {import('./ColaboradorDto.js').ColaboradorDto|null} colaborador null en contribuciones anónimas.
 * @property {boolean} esPublica
 * @property {string} fecha
 * @property {import('../Enums/COLABORACION_ESTADO.js').ColaboracionEstado} estado
 * @property {string|null} fechaResolucion
 * @property {string|null} fechaFin
 * @property {import('./ValoracionDto.js').ValoracionDto|null} valoracionDelColectivo
 * @property {import('./ValoracionDto.js').ValoracionDto|null} valoracionDelColaborador
 */
export {};
