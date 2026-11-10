export function tienePermiso(cuenta, permiso) {
  if (!cuenta) return false;
  const contexto = cuenta.contextoActual;
  if (!contexto) return Boolean(cuenta.rol);
  return Array.isArray(contexto.permisos) && contexto.permisos.includes(permiso);
}
