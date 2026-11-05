/**
 * Contrato HTTP de Health. Respuestas JSON sin transformación.
 * @typedef {Object} IHealthHttpClient
 * @property {(options?: {signal?: AbortSignal}) => Promise<import('../Entities/HealthDto.js').HealthDto>} consultar
 */
export {};
