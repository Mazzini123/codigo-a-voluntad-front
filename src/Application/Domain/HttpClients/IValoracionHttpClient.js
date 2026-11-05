/**
 * Contrato HTTP de Valoracion. Respuestas JSON sin transformación.
 * @typedef {Object} IValoracionHttpClient
 * @property {(proyectoId: string, colaboracionId: string, request: import('../Requests/Valoracion/ValorarColaboracionRequest.js').ValorarColaboracionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ValoracionDto.js').ValoracionDto>} valorar
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ResumenValoracionesDto.js').ResumenValoracionesDto<import('../Entities/ValoracionDeColectivoDto.js').ValoracionDeColectivoDto>>} obtenerDeColectivo
 * @property {(colaboradorId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ResumenValoracionesDto.js').ResumenValoracionesDto<import('../Entities/ValoracionDeColaboradorDto.js').ValoracionDeColaboradorDto>>} obtenerDeColaborador
 */
export {};
