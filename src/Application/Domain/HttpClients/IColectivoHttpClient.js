/**
 * Contrato HTTP de Colectivo. Respuestas JSON sin transformación.
 * @typedef {Object} IColectivoHttpClient
 * @property {(query?: import('../Requests/App/ListadoConEtiquetaRequest.js').ListadoConEtiquetaRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/ColectivoDto.js').ColectivoDto>>} listar
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColectivoDto.js').ColectivoDto>} obtenerPorId
 * @property {(request: import('../Requests/Colectivo/CrearColectivoRequest.js').CrearColectivoRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColectivoDto.js').ColectivoDto>} crear
 * @property {(colectivoId: string, request: import('../Requests/Colectivo/ActualizarColectivoRequest.js').ActualizarColectivoRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColectivoDto.js').ColectivoDto>} actualizar
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColectivoDto.js').ColectivoDto>} darDeBaja
 */
export {};
