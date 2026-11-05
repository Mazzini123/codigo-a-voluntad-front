/**
 * @typedef {Object} NotificacionDto
 * @property {string} id
 * @property {string} destinatarioId
 * @property {import('../Enums/TIPO_NOTIFICACION.js').TipoNotificacion} tipo
 * @property {string} asunto
 * @property {string} contenido
 * @property {import('./ReferenciasNotificacionDto.js').ReferenciasNotificacionDto} referencias
 * @property {string} fecha
 * @property {boolean} esLeida
 * @property {{canal: string, exito: boolean}[]} envios
 */
export {};
