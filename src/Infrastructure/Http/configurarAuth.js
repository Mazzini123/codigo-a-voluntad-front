const sinSesion = {
  obtenerToken: async () => null,
  alExpirar: () => {},
};

let auth = sinSesion;

export function configurarAuth({ obtenerToken, alExpirar } = {}) {
  auth = {
    obtenerToken: obtenerToken ?? sinSesion.obtenerToken,
    alExpirar: alExpirar ?? sinSesion.alExpirar,
  };
}

export async function obtenerTokenActual() {
  try {
    return await auth.obtenerToken();
  } catch {
    return null;
  }
}

export function avisarSesionVencida() {
  auth.alExpirar();
}
