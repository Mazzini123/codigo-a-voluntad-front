/**
 * Enviar al menos un campo. No enviar URLs, estado o porcentaje de concreción.
 * @typedef {Object} ActualizarProyectoRequest
 * @property {string} [titulo]
 * @property {string} [descripcion]
 * @property {string[]} [etiquetas]
 * @property {import('../../Enums/MODO_ACEPTACION.js').ModoAceptacion} [modoAceptacion]
 * @property {number|null} [limiteVacantes]
 * @property {string|null} [fechaCierre]
 */
export {};
