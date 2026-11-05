/**
 * Enviar al menos un campo. No permite modificar tipoColectivo.
 * @typedef {Object} ActualizarColectivoRequest
 * @property {string} [nombre]
 * @property {string} [descripcion]
 * @property {import('../App/UbicacionRequest.js').UbicacionRequest|null} [ubicacion]
 * @property {import('../App/RedSocialRequest.js').RedSocialRequest[]} [redesSociales] Hasta 10.
 * @property {string[]} [etiquetas]
 * @property {import('../App/MedioDeContactoRequest.js').MedioDeContactoRequest[]} [mediosDeContacto] Hasta 10.
 */
export {};
