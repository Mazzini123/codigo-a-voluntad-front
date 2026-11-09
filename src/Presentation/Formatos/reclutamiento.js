const LARGO_DE_PERFIL_EN_DIALOGO = 100;

export const MOTIVO_SIN_MENSAJERIA = "No recibe mensajes internos.";
export const TITULO_SIN_CANDIDATAS = "Todavía no hay colaboradoras con estas habilidades";

export function recibeMensajeriaInterna(colaborador) {
  return colaborador?.recibeMensajeriaInterna === true;
}

export function cantidadDeOpcionalesQueTiene(candidata) {
  const valor = candidata?.habilidadesOpcionalesQueTiene;
  if (Array.isArray(valor)) return valor.length;
  return Number.isInteger(valor) ? valor : 0;
}

export function textoOpcionalesQueTiene(tiene, total) {
  if (!total) return "";
  return `Tiene ${tiene} de ${total} ${total === 1 ? "habilidad opcional" : "habilidades opcionales"}`;
}

function recortar(texto, largo) {
  const limpio = (texto ?? "").trim();
  return limpio.length > largo ? `${limpio.slice(0, largo).trimEnd()}…` : limpio;
}

export function descripcionDeInvitacion(perfil, proyecto) {
  const descripcion = recortar(perfil?.descripcion, LARGO_DE_PERFIL_EN_DIALOGO);
  return `Va a recibir tu mensaje en su bandeja de la plataforma, para el perfil «${descripcion}» de «${proyecto?.titulo ?? ""}».`;
}

export function textoDeCaracteresRestantes(restantes) {
  if (restantes < 0)
    return `Te pasaste por ${-restantes} ${restantes === -1 ? "carácter" : "caracteres"}`;
  return restantes === 1 ? "Queda 1 carácter" : `Quedan ${restantes} caracteres`;
}

export function avisoDeInvitacionEnviada(nombre) {
  return `Invitación enviada a «${nombre}».`;
}
