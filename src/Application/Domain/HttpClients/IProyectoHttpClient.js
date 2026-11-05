/**
 * Contrato HTTP de Proyecto. Respuestas JSON sin transformación.
 * @typedef {Object} IProyectoHttpClient
 * @property {(proyectoId: string, colaboradorId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/MedioDeContactoDto.js').MedioDeContactoDto[]>} obtenerContactoDeColaborador
 * @property {(query?: import('../Requests/App/ListadoConEtiquetaRequest.js').ListadoConEtiquetaRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/ProyectoDto.js').ProyectoDto>>} listar
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ProyectoDto.js').ProyectoDto>} obtenerPorId
 * @property {(colectivoId: string, request: import('../Requests/Proyecto/CrearProyectoRequest.js').CrearProyectoRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ProyectoDto.js').ProyectoDto>} crear
 * @property {(colectivoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ProyectoDto.js').ProyectoDto[]>} listarPorColectivo
 * @property {(proyectoId: string, request: import('../Requests/Proyecto/ActualizarProyectoRequest.js').ActualizarProyectoRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ProyectoDto.js').ProyectoDto>} actualizar
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ProyectoDto.js').ProyectoDto>} finalizar
 */
export {};
