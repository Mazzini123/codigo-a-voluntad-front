/**
 * Contrato HTTP de Colaborador. Respuestas JSON sin transformación.
 * @typedef {Object} IColaboradorHttpClient
 * @property {(query?: import('../Requests/App/PaginacionRequest.js').PaginacionRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PaginaDto.js').PaginaDto<import('../Entities/ColaboradorDto.js').ColaboradorDto>>} listar
 * @property {(colaboradorId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} obtenerPorId
 * @property {(request: import('../Requests/Colaborador/CrearColaboradorRequest.js').CrearColaboradorRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} crear
 * @property {(colaboradorId: string, request: import('../Requests/Colaborador/ActualizarColaboradorRequest.js').ActualizarColaboradorRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} actualizar
 * @property {(colaboradorId: string, request: import('../Requests/Colaborador/AgregarPronombreRequest.js').AgregarPronombreRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} agregarPronombre
 * @property {(colaboradorId: string, pronombre: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} quitarPronombre
 * @property {(colaboradorId: string, request: import('../Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} agregarHabilidad
 * @property {(colaboradorId: string, codigoHabilidad: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/ColaboradorDto.js').ColaboradorDto>} quitarHabilidad
 * @property {(colaboradorId: string, request: import('../Requests/App/MedioDeContactoRequest.js').MedioDeContactoRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/MedioDeContactoDto.js').MedioDeContactoDto>} agregarMedioDeContacto
 * @property {(colaboradorId: string, tipo: string, valor: string, options?: {signal?: AbortSignal}) => Promise<void>} quitarMedioDeContacto
 */
export {};
