const SIN_CONEXION = "No pudimos conectarnos con el servidor. Revisá tu conexión.";
const DEMORA = "El servidor tardó demasiado en responder. Probá de nuevo.";
const ERROR_DEL_SERVIDOR =
  "Tuvimos un problema en el servidor. Probá de nuevo en unos minutos.";

const FIJOS = {
  401: "Tu sesión venció. Iniciá sesión de nuevo.",
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

const OPERACIONES = [
  {
    metodo: "post",
    ruta: /^\/proyectos\/[^/]+\/colaboraciones$/,
    mensajes: {
      400: "No pudimos registrar tu postulación. Puede que la búsqueda de este perfil ya haya cerrado.",
      409: "Ya te postulaste a este proyecto.",
      422: "No pudimos registrar tu postulación. Puede que la búsqueda de este perfil ya haya cerrado.",
    },
  },
  {
    metodo: "post",
    ruta: /^\/(colectivos|colaboradores)$/,
    mensajes: { 409: "Tu cuenta ya tiene un perfil." },
  },
  {
    metodo: "post",
    ruta: /^\/colectivos\/[^/]+\/proyectos$/,
    mensajes: {
      400: "No pudimos publicar el proyecto. Revisá los datos que cargaste y probá de nuevo.",
      422: "No pudimos publicar el proyecto. Revisá los datos que cargaste y probá de nuevo.",
    },
  },
  {
    metodo: "post",
    ruta: /^\/habilidades$/,
    mensajes: { 409: "Esa habilidad ya existe." },
  },
];

export function esDemora(error) {
  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
}

function rutaDe(config) {
  const url = config?.url ?? "";
  return url.split("?")[0].replace(/\/+$/, "");
}

function mensajeDeLaOperacion(config, status) {
  const metodo = config?.method?.toLowerCase();
  const ruta = rutaDe(config);
  const operacion = OPERACIONES.find(
    (candidata) => candidata.metodo === metodo && candidata.ruta.test(ruta),
  );
  return operacion?.mensajes[status] ?? null;
}

export function describirError(error) {
  if (!error.response) {
    return { mensaje: esDemora(error) ? DEMORA : SIN_CONEXION, esReintentable: true };
  }
  const { status } = error.response;
  if (status >= 500) return { mensaje: ERROR_DEL_SERVIDOR, esReintentable: true };
  if (FIJOS[status]) return { mensaje: FIJOS[status], esReintentable: false };
  return {
    mensaje:
      mensajeDeLaOperacion(error.config, status) ?? POR_DEFECTO[status] ?? GENERICO,
    esReintentable: false,
  };
}
