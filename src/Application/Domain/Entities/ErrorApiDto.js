/**
 * Body de error del back. axiosClient lo traduce a un ApiError (Infrastructure/Http/ApiError.js).
 * @typedef {Object} ErrorApiDto
 * @property {string} message
 * @property {string} [detalle]
 * @property {{code: string, path: (string|number)[], message: string}[]} [issues]
 */
export {};
