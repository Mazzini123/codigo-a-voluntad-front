import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";

const SIN_CONEXION = "No pudimos conectarnos con el servidor. Revisá tu conexión.";
const DEMORA = "El servidor tardó demasiado en responder. Probá de nuevo.";
const ERROR_DEL_SERVIDOR =
  "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.";

const FIJOS = {
  401: "No pudimos autorizar este pedido.",
  403: "No tenés permiso para hacer esto.",
  429: "Hiciste muchos pedidos seguidos. Esperá unos segundos y volvé a intentar.",
};

const POR_DEFECTO = {
  400: "Revisá los datos ingresados.",
  404: "No encontramos lo que buscabas.",
  409: "Esto ya no se puede hacer porque algo cambió. Actualizá la página y probá de nuevo.",
  422: "Revisá los datos ingresados.",
};

const GENERICO = "No pudimos completar la operación.";

export const MENSAJES_DE_SESION = new Map([
  [
    CODIGO_ERROR.CONTEXTO_NO_ACTUAL,
    "Cambiaste de perfil o de colectivo en otra ventana. Actualizamos tu sesión: revisá y volvé a intentar.",
  ],
  [
    CODIGO_ERROR.CONTEXTO_INACTIVO,
    "Ya no podés operar con ese perfil o colectivo. Actualizamos tu sesión.",
  ],
  [CODIGO_ERROR.CONTEXTO_INVALIDO, "Ese perfil no es tuyo. Actualizamos tu sesión."],
  [
    CODIGO_ERROR.CONTEXTO_REQUERIDO,
    "Elegí con qué perfil querés operar y volvé a intentar.",
  ],
  [CODIGO_ERROR.PERMISO_INSUFICIENTE, "Tu rol en este colectivo no permite hacer esto."],
  [CODIGO_ERROR.NOMBRE_REQUERIDO, "Antes de seguir, contanos tu nombre."],
  [
    CODIGO_ERROR.MODALIDAD_INCOMPATIBLE,
    "Tu cuenta ya opera con otro tipo de perfil. No se pueden usar los dos a la vez.",
  ],
]);

export function esDemora(error) {
  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
}

export function describirError(error, { sesionVencida = false } = {}) {
  if (!error.response) {
    return { mensaje: esDemora(error) ? DEMORA : SIN_CONEXION, esReintentable: true };
  }
  const { status } = error.response;
  if (status === 401 && sesionVencida) {
    return {
      mensaje: "Tu sesión venció. Iniciá sesión de nuevo.",
      esReintentable: false,
    };
  }
  const codigo = error.response.data?.codigo;
  if (MENSAJES_DE_SESION.has(codigo)) {
    return { mensaje: MENSAJES_DE_SESION.get(codigo), esReintentable: false };
  }
  if (status >= 500) return { mensaje: ERROR_DEL_SERVIDOR, esReintentable: true };
  if (FIJOS[status]) return { mensaje: FIJOS[status], esReintentable: false };
  return {
    mensaje: POR_DEFECTO[status] ?? GENERICO,
    esReintentable: false,
  };
}
