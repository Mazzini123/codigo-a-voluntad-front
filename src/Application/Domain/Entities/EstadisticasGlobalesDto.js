/**
 * @typedef {Object} EstadisticasGlobalesDto
 * @property {{total: number, activos: number, dadosDeBaja: number}} colectivos
 * @property {import('./ResumenProyectosDto.js').ResumenProyectosDto} proyectos
 * @property {{total: number}} colaboradores
 * @property {import('./ResumenColaboracionesDto.js').ResumenColaboracionesDto & {anonimas: number}} colaboraciones
 * @property {import('./RankingHabilidadDto.js').RankingHabilidadDto[]} habilidadesMasRequeridas
 * @property {import('./RankingHabilidadDto.js').RankingHabilidadDto[]} habilidadesMasOfrecidas
 * @property {string} generadoEn
 */
export {};
