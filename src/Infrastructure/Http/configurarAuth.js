const sinSesion = {
  obtenerToken: async () => null,
  alExpirar: () => {},
  permiteSinToken: async () => false,
  obtenerContextoId: () => null,
  alCambiarContexto: () => {},
};

let auth = { ...sinSesion, clave: null, generacion: 0, habilitada: false };

export function configurarAuth({
  clave = Symbol(),
  obtenerToken = sinSesion.obtenerToken,
  alExpirar = sinSesion.alExpirar,
  permiteSinToken = sinSesion.permiteSinToken,
  obtenerContextoId = sinSesion.obtenerContextoId,
  alCambiarContexto = sinSesion.alCambiarContexto,
} = {}) {
  const mismaSesion = auth.clave === clave;
  auth = {
    clave,
    obtenerToken,
    alExpirar,
    permiteSinToken,
    obtenerContextoId,
    alCambiarContexto,
    generacion: mismaSesion ? auth.generacion : auth.generacion + 1,
    habilitada: mismaSesion ? auth.habilitada : true,
  };
}

export function desconfigurarAuth(clave) {
  if (auth.clave !== clave) return;
  auth = {
    ...sinSesion,
    clave: null,
    generacion: auth.generacion + 1,
    habilitada: false,
  };
}

export function cambiarSesionHttp(clave, habilitada) {
  if (auth.clave !== clave) return;
  auth = { ...auth, habilitada, generacion: auth.generacion + 1 };
  return auth.generacion;
}

export function sesionHttpActual() {
  return auth;
}

export function sesionHttpVigente(generacion) {
  return auth.generacion === generacion;
}

export function avisarSesionVencida(generacion) {
  if (!auth.habilitada || !sesionHttpVigente(generacion)) return false;
  const { clave, alExpirar } = auth;
  cambiarSesionHttp(clave, false);
  alExpirar();
  return true;
}

export function cambiarContextoHttp(clave) {
  if (auth.clave !== clave) return;
  auth = { ...auth, generacion: auth.generacion + 1 };
  return auth.generacion;
}

export function avisarContextoDesactualizado(generacion) {
  if (!auth.habilitada || !sesionHttpVigente(generacion)) return false;
  auth.alCambiarContexto();
  return true;
}
