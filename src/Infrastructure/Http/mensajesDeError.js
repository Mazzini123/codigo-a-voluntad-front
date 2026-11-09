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
  if (status >= 500) return { mensaje: ERROR_DEL_SERVIDOR, esReintentable: true };
  if (FIJOS[status]) return { mensaje: FIJOS[status], esReintentable: false };
  return {
    mensaje: POR_DEFECTO[status] ?? GENERICO,
    esReintentable: false,
  };
}
