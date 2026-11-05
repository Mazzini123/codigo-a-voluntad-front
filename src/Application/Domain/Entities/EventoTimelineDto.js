/**
 * Evento público. Los datos adicionales dependen del tipo; alta/baja no incluyen proyecto.
 * @typedef {Object} EventoTimelineDto
 * @property {import('../Enums/TIPO_EVENTO_TIMELINE.js').TipoEventoTimeline} tipo
 * @property {string} fecha
 * @property {import('./ResumenProyectoDto.js').ResumenProyectoDto} [proyecto]
 * @property {{titulo: string, descripcion: string}} [logro]
 * @property {{porcentajeConcrecion: number, urlSistema: string|null, urlRepositorio: string|null}} [avance]
 * @property {{id: string, nombre: string}|null} [colaborador] Sólo para COLABORACION_CERRADA; null cuando es anónima.
 */
export {};
