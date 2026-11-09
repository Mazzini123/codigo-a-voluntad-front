import { useEffect, useRef, useSyncExternalStore } from "react";

export function crearSesionFalsa({
  autenticado = false,
  token = "token-de-prueba",
  completa = true,
} = {}) {
  let valor = autenticado;
  const oyentes = new Set();
  const suscribir = (oyente) => {
    oyentes.add(oyente);
    return () => oyentes.delete(oyente);
  };
  const sesion = {
    inicios: [],
    salidas: 0,
    get autenticado() {
      return valor;
    },
    set autenticado(nuevo) {
      valor = nuevo;
      oyentes.forEach((oyente) => oyente());
    },
    async iniciar(opciones = {}) {
      sesion.inicios.push(opciones);
    },
    async cerrar() {
      sesion.salidas += 1;
      sesion.autenticado = false;
    },
    async limpiar() {
      sesion.autenticado = false;
    },
    obtenerToken: async () => (sesion.autenticado ? token : null),
    async completarIngreso() {
      sesion.autenticado = true;
    },
  };
  const acciones = {
    cargando: false,
    error: null,
    iniciar: (opciones) => sesion.iniciar(opciones),
    cerrar: () => sesion.cerrar(),
    limpiar: () => sesion.limpiar(),
    obtenerToken: () => sesion.obtenerToken(),
  };
  sesion.usarSesion = function useSesionFalsa() {
    const actual = useSyncExternalStore(suscribir, () => valor);
    return { ...acciones, autenticado: actual };
  };
  sesion.CallbackComponent = function CallbackFalso({ alCompletar, alFallar }) {
    const iniciado = useRef(false);
    useEffect(() => {
      if (iniciado.current) return;
      iniciado.current = true;
      sesion.completarIngreso().then(completa ? alCompletar : alFallar, alFallar);
    }, [alCompletar, alFallar]);
    return null;
  };
  return sesion;
}
