/**
 * @typedef {Object} ColectivoDto
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {import('../Enums/TIPO_COLECTIVO.js').TipoColectivo} tipoColectivo
 * @property {import('./UbicacionDto.js').UbicacionDto|null} ubicacion
 * @property {import('./ProyectoDto.js').ProyectoDto[]} proyectos
 * @property {import('./RedSocialDto.js').RedSocialDto[]} redesSociales
 * @property {string[]} etiquetas
 * @property {import('./MedioDeContactoDto.js').MedioDeContactoDto[]} mediosDeContacto
 * @property {string} fechaAlta
 * @property {string|null} fechaBaja
 */
export {};
