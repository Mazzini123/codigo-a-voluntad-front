/**
 * Contrato del proveedor de identidad. Cambiar de proveedor es cambiar la implementación.
 * @typedef {Object} Identidad
 * @property {() => Promise<boolean>} estaAutenticado
 * @property {(opciones?: { registro?: boolean }) => Promise<void>} iniciarSesion
 * @property {(url: string) => Promise<void>} completarIngreso
 * @property {() => Promise<string | null>} obtenerToken
 * @property {() => Promise<void>} cerrarSesion
 * @property {() => Promise<void>} olvidarSesion
 */
export {};
