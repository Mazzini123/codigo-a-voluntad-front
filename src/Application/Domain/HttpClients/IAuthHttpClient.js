/**
 * Contrato HTTP de la cuenta con sesión. Respuestas JSON sin transformación.
 * @typedef {Object} IAuthHttpClient
 * @property {(options?: {signal?: AbortSignal}) => Promise<import('../Entities/CuentaDto.js').CuentaDto>} obtenerCuentaActual
 */
export {};
