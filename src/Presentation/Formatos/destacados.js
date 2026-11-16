import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { MAXIMO_DE_DESTACADOS } from "@/Application/Domain/Reglas/destacados.js";

export function textoDeCupo(usados) {
  if (usados === 0) return `Ningún lugar usado de ${MAXIMO_DE_DESTACADOS}`;
  const lugares = usados === 1 ? "lugar usado" : "lugares usados";
  return `${usados} ${lugares} de ${MAXIMO_DE_DESTACADOS}`;
}

export const MOTIVO_CUPO_COMPLETO = `Ya hay ${MAXIMO_DE_DESTACADOS} proyectos destacados. Quitá uno para sumar otro.`;

const SIN_PERMISO = "No tenés permiso para hacer esto.";

const MENSAJES = Object.freeze({
  destacar: {
    fallo: "No pudimos destacar el proyecto. Probá de nuevo.",
    403: SIN_PERMISO,
    404: "No encontramos ese proyecto. Actualizamos la lista.",
    409: MOTIVO_CUPO_COMPLETO,
    422: "Solo se pueden destacar proyectos abiertos de colectivos activos.",
    [CODIGO_ERROR.CONFLICTO_DE_INTERESES]:
      "No podés destacar un proyecto de un colectivo del que sos parte.",
  },
  quitar: {
    fallo: "No pudimos quitar el destacado. Probá de nuevo.",
    403: SIN_PERMISO,
    404: "Ese proyecto ya no estaba destacado. Actualizamos la lista.",
  },
});

export function mensajeDeDestacado(error, accion) {
  const mensajes = MENSAJES[accion];
  return mensajes[error?.codigo] ?? mensajes[error?.status] ?? mensajes.fallo;
}
