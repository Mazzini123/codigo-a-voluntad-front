export const LIMITE_DE_MENSAJE = 500;
export const AVISO_DE_CARACTERES = 50;

export function validarInvitacion(mensaje) {
  if (mensaje.trim().length === 0) return "Escribí un mensaje para la invitación.";
  if (mensaje.length > LIMITE_DE_MENSAJE)
    return `El mensaje puede tener hasta ${LIMITE_DE_MENSAJE} caracteres.`;
  return null;
}

export function caracteresRestantes(mensaje) {
  return LIMITE_DE_MENSAJE - mensaje.length;
}

export function armarInvitacion(colaboradorId, mensaje) {
  return { colaboradorId, mensaje };
}
