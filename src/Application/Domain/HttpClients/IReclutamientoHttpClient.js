/**
 * Contrato HTTP de Reclutamiento. Respuestas JSON sin transformación.
 * @typedef {Object} IReclutamientoHttpClient
 * @property {(proyectoId: string, perfilId: string, query?: import('../Requests/App/PaginacionRequest.js').PaginacionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/ColaboradoraPotencialDto.js').ColaboradoraPotencialDto>>} buscarColaboradoras
 * @property {(colaboradorId: string, query?: import('../Requests/App/PaginacionRequest.js').PaginacionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/ProyectoDto.js').ProyectoDto>>} buscarProyectos
 * @property {(proyectoId: string, perfilId: string, request: import('../Requests/Reclutamiento/InvitarColaboradorRequest.js').InvitarColaboradorRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/NotificacionDto.js').NotificacionDto>} invitar
 */
export {};
