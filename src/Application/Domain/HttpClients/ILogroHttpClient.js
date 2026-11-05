/**
 * Contrato HTTP de Logro. Respuestas JSON sin transformación.
 * @typedef {Object} ILogroHttpClient
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/LogroDto.js').LogroDto[]>} listar
 * @property {(proyectoId: string, logroId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/LogroDto.js').LogroDto>} obtenerPorId
 * @property {(proyectoId: string, request: import('../Requests/Logro/CrearLogroRequest.js').CrearLogroRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/LogroDto.js').LogroDto>} crear
 * @property {(proyectoId: string, logroId: string, request: import('../Requests/Logro/ActualizarLogroRequest.js').ActualizarLogroRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/LogroDto.js').LogroDto>} actualizar
 * @property {(proyectoId: string, logroId: string, options?: {signal?: AbortSignal}) => Promise<void>} eliminar
 */
export {};
