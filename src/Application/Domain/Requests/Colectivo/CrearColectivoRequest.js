/**
 * @typedef {Object} CrearColectivoRequest
 * @property {string} nombre
 * @property {string} descripcion
 * @property {import('../../Enums/TIPO_COLECTIVO.js').TipoColectivo} tipoColectivo
 * @property {import('../App/UbicacionRequest.js').UbicacionRequest|null} [ubicacion]
 * @property {import('../App/RedSocialRequest.js').RedSocialRequest[]} [redesSociales] Hasta 10.
 * @property {string[]} [etiquetas] Hasta 10; cada etiqueta de 1 a 30 caracteres.
 * @property {import('../App/MedioDeContactoRequest.js').MedioDeContactoRequest[]} [mediosDeContacto] Hasta 10.
 */
export {};
