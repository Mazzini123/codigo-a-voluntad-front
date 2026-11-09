export const TEXTO_SIN_AVANCES = "Todavía no se registraron avances";
export const TEXTO_SIN_LOGROS = "Todavía no se cargaron logros";
export const NOTA_DE_PROYECTO_FINALIZADO =
  "El proyecto está finalizado: ya no se pueden cargar cambios";
export const MENSAJE_SOLO_DUENO = "Solo el colectivo dueño puede hacer este cambio";
export const MENSAJE_LOGRO_REPETIDO = "Ya hay un logro con ese título";
export const MENSAJE_AVANCE_RECHAZADO =
  "No pudimos registrar el avance. Revisá el porcentaje y los enlaces.";
export const AVISO_LOGRO_CARGADO = "Cargamos el logro.";
export const AVISO_LOGRO_EDITADO = "Guardamos los cambios del logro.";
export const AVISO_LOGRO_ELIMINADO = "Eliminamos el logro.";

export function textoDePorcentaje(porcentaje) {
  return `${porcentaje} %`;
}

export function avisoDeAvanceRegistrado(porcentaje) {
  return `Registramos el avance: ${textoDePorcentaje(porcentaje)}.`;
}

function marcaDeTiempo(registro) {
  const marca = Date.parse(registro?.fecha);
  return Number.isNaN(marca) ? -Infinity : marca;
}

export function ordenarPorFechaDesc(registros) {
  return registros
    .map((registro, indice) => ({ registro, indice }))
    .sort(
      (a, b) =>
        marcaDeTiempo(b.registro) - marcaDeTiempo(a.registro) || a.indice - b.indice,
    )
    .map(({ registro }) => registro);
}

function esPorcentaje(valor) {
  return Number.isFinite(valor) && valor >= 0 && valor <= 100;
}

export function porcentajeActual(proyecto, avancesOrdenados) {
  if (esPorcentaje(proyecto?.porcentajeConcrecion)) return proyecto.porcentajeConcrecion;
  const reciente = avancesOrdenados.find((avance) =>
    esPorcentaje(avance.porcentajeConcrecion),
  );
  return reciente ? reciente.porcentajeConcrecion : null;
}

export function tituloDelAvance(titulo) {
  return `Avance de ${titulo}`;
}

export function textoDeAvanceRegistrado(avance) {
  return esPorcentaje(avance.porcentajeConcrecion)
    ? `Avance registrado: ${textoDePorcentaje(avance.porcentajeConcrecion)}`
    : "Avance registrado";
}
