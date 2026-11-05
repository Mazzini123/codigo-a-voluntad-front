/**
 * Contrato HTTP de Perfil. Respuestas JSON sin transformación.
 * @typedef {Object} IPerfilHttpClient
 * @property {(proyectoId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto[]>} listar
 * @property {(proyectoId: string, perfilId: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} obtenerPorId
 * @property {(proyectoId: string, request: import('../Requests/Perfil/CrearPerfilRequest.js').CrearPerfilRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} crear
 * @property {(proyectoId: string, perfilId: string, request: import('../Requests/Perfil/ActualizarPerfilRequest.js').ActualizarPerfilRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} actualizar
 * @property {(proyectoId: string, perfilId: string, options?: {signal?: AbortSignal}) => Promise<void>} eliminar
 * @property {(proyectoId: string, perfilId: string, request: import('../Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} agregarHabilidadRequerida
 * @property {(proyectoId: string, perfilId: string, codigoHabilidad: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} quitarHabilidadRequerida
 * @property {(proyectoId: string, perfilId: string, request: import('../Requests/App/AgregarHabilidadRequest.js').AgregarHabilidadRequest, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} agregarHabilidadOpcional
 * @property {(proyectoId: string, perfilId: string, codigoHabilidad: string, options?: {signal?: AbortSignal}) => Promise<import('../Entities/PerfilDto.js').PerfilDto>} quitarHabilidadOpcional
 */
export {};
