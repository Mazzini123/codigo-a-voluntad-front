/**
 * Contrato HTTP de Colaboracion. Respuestas JSON sin transformación.
 * @typedef {Object} IColaboracionHttpClient
 * @property {(proyectoId: string, request: import('../Requests/Colaboracion/RegistrarColaboracionRequest.js').RegistrarColaboracionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDto.js').ColaboracionDto>} registrar
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDto.js').ColaboracionDto[]>} listarPorProyecto
 * @property {(colaboradorId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDeColaboradorDto.js').ColaboracionDeColaboradorDto[]>} listarPorColaborador
 * @property {(proyectoId: string, colaboracionId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDto.js').ColaboracionDto>} aceptar
 * @property {(proyectoId: string, colaboracionId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDto.js').ColaboracionDto>} rechazar
 * @property {(proyectoId: string, colaboracionId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboracionDto.js').ColaboracionDto>} finalizar
 */
export {};
