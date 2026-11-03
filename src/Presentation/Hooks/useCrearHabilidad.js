import { useEffect, useRef, useState } from "react";
import { habilidadDependencies } from "../Dependencies/habilidadDependencies.js";
import { obtenerMensajeError } from "./obtenerMensajeError.js";

export function useCrearHabilidad(dependencies = habilidadDependencies) {
  const [estado, setEstado] = useState({ guardando: false, error: "" });
  const pendiente = useRef(null);
  useEffect(() => () => pendiente.current?.abort(), []);

  async function crear(request) {
    if (pendiente.current) return false;
    const controller = new AbortController();
    pendiente.current = controller;
    setEstado({ guardando: true, error: "" });
    try {
      await dependencies.crearHabilidad(request, { signal: controller.signal });
      if (controller.signal.aborted) return false;
      setEstado({ guardando: false, error: "" });
      return true;
    } catch (error) {
      if (!controller.signal.aborted)
        setEstado({ guardando: false, error: obtenerMensajeError(error) });
      return false;
    } finally {
      if (pendiente.current === controller) pendiente.current = null;
    }
  }
  return { ...estado, crear };
}
