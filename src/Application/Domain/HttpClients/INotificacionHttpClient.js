/**
 * Contrato HTTP de Notificacion. Respuestas JSON sin transformación.
 * @typedef {Object} INotificacionHttpClient
 * @property {(colaboradorId: string, query?: import('../Requests/App/PaginacionRequest.js').PaginacionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/NotificacionDto.js').NotificacionDto>>} listar
 * @property {(colaboradorId: string, notificacionId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/NotificacionDto.js').NotificacionDto>} marcarComoLeida
 */
export {};
