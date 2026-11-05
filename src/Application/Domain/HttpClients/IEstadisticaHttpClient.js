/**
 * Contrato HTTP de Estadistica. Respuestas JSON sin transformación.
 * @typedef {Object} IEstadisticaHttpClient
 * @property {(options?: {signal?: AbortSignal}) => Promise<import('../Entities/EstadisticasGlobalesDto.js').EstadisticasGlobalesDto>} obtenerGlobales
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/EstadisticasColectivoDto.js').EstadisticasColectivoDto>} obtenerDeColectivo
 */
export {};
