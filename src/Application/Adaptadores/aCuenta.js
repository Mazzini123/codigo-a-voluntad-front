export function aCuenta(dto) {
  if (!dto) return null;
  return {
    id: dto.id,
    rol: dto.rol ?? null,
    perfilId: dto.perfilId ?? null,
    usuarioId: dto.usuario?.id ?? null,
    nombre: dto.usuario?.nombre ?? null,
    nombrePendiente: dto.usuario?.nombrePendiente ?? false,
    contextoActual: dto.contextoActual ?? null,
    contextos: dto.contextos ?? [],
  };
}
