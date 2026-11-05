/**
 * Contrato HTTP de Timeline. Respuestas JSON sin transformación.
 * @typedef {Object} ITimelineHttpClient
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/EventoTimelineDto.js').EventoTimelineDto[]>} obtenerDeColectivo
 */
export {};
