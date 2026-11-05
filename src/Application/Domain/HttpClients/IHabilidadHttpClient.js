/**
 * Contrato estructural del cliente HTTP, sin herencia ni clases abstractas.
 * @typedef {Object} IHabilidadHttpClient
 * @property {(query?: import('../Requests/App/PaginacionRequest.js').PaginacionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/HabilidadDto.js').HabilidadDto>>} listar
 * @property {(request: import('../Requests/Habilidad/CrearHabilidadRequest.js').CrearHabilidadRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/HabilidadDto.js').HabilidadDto>} crear
 */
export {};
