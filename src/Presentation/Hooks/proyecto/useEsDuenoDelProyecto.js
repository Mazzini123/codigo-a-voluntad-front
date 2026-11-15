import { useCallback } from "react";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
export function useEsDuenoDelProyecto(proyectoOId, dependencies = proyectoDependencies) {
  const { usuario } = useAuth();
  const colectivoId = usuario?.rol === ROL_CUENTA.COLECTIVO ? usuario.perfilId : null;
  const conocido = typeof proyectoOId === "object" ? proyectoOId : null;
  const id = conocido?.id ?? proyectoOId;
  const requiereConsulta = Boolean(colectivoId && !conocido);
  const obtener = useCallback(
    (signal) => (requiereConsulta ? dependencies.obtenerProyecto(id, { signal }) : null),
    [requiereConsulta, dependencies, id],
  );
  const { datos, error, reintentar } = useConsulta(obtener);
  if (!colectivoId) return { esColectivo: false, esDueno: false };
  const proyecto = conocido ?? datos;
  if (error || !proyecto) return { esColectivo: true, esDueno: null, error, reintentar };
  return { esColectivo: true, esDueno: proyecto.colectivo?.id === colectivoId };
}
