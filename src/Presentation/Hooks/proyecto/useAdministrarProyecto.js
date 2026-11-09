import { useState } from "react";
import { perfilDependencies } from "@/Presentation/Dependencies/perfilDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { perfilARequest } from "@/Presentation/Formularios/proyecto/formularioProyecto.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

function correrOperacion(_signal, operacion) {
  return operacion();
}

export function useAdministrarProyecto(proyectoId, recargar) {
  const mutacion = useMutacion(correrOperacion);
  const [recargando, setRecargando] = useState(false);

  async function ejecutar(operacion) {
    const { ok, ignorada } = await mutacion.ejecutar(operacion);
    if (ignorada) return false;
    setRecargando(true);
    await recargar();
    setRecargando(false);
    return ok;
  }

  return {
    guardando: mutacion.enviando || recargando,
    error: mutacion.error,
    ejecutar,
    limpiar: mutacion.reiniciar,
    actualizar: (cambios) => proyectoDependencies.actualizarProyecto(proyectoId, cambios),
    finalizar: () => proyectoDependencies.finalizarProyecto(proyectoId),
    crearPerfil: (borrador) =>
      perfilDependencies.crearPerfil(proyectoId, perfilARequest(borrador)),
    actualizarPerfil: (perfilId, cambios) =>
      perfilDependencies.actualizarPerfil(proyectoId, perfilId, cambios),
  };
}
