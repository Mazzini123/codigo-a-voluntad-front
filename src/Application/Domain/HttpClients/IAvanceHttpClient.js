/**
 * Contrato HTTP de Avance. Respuestas JSON sin transformación.
 * @typedef {Object} IAvanceHttpClient
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/AvanceDto.js').AvanceDto[]>} listar
 * @property {(proyectoId: string, avanceId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/AvanceDto.js').AvanceDto>} obtenerPorId
 * @property {(proyectoId: string, request: import('../Requests/Avance/RegistrarAvanceRequest.js').RegistrarAvanceRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/AvanceDto.js').AvanceDto>} registrar
 */
export {};
