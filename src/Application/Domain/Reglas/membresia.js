export function puedePedirIngreso(usuario, colectivo) {
  if (!usuario?.usuarioId || colectivo.fechaBaja) return false;
  const contextos = usuario.contextos ?? [];
  return !contextos.some((contexto) => contexto.colectivo?.id === colectivo.id);
}
