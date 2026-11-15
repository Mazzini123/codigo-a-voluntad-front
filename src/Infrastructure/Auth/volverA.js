const CLAVE = "codigo-a-voluntad:volver-a";

export function recordarVolverA(ruta) {
  try {
    if (ruta) sessionStorage.setItem(CLAVE, ruta);
    else sessionStorage.removeItem(CLAVE);
  } catch {
    return;
  }
}

export function tomarVolverA() {
  try {
    const ruta = sessionStorage.getItem(CLAVE);
    sessionStorage.removeItem(CLAVE);
    return ruta?.startsWith("/") && !ruta.startsWith("//") ? ruta : null;
  } catch {
    return null;
  }
}
