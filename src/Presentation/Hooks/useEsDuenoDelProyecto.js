import { useCallback } from "react";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { colectivoDependencies } from "../Dependencies/colectivoDependencies.js";
import { useAsync } from "./useAsync.js";
import { useAuth } from "./useAuth.js";

const NO_ES_COLECTIVO = Object.freeze({ esColectivo: false, esDueno: false });
const SIN_SABER = Object.freeze({ esColectivo: true, esDueno: null });

export function useEsDuenoDelProyecto(proyectoId, dependencies = colectivoDependencies) {
  const { usuario } = useAuth();
  const colectivoId = usuario?.rol === ROL_CUENTA.COLECTIVO ? usuario.perfilId : null;
  const obtener = useCallback(
    async (signal) =>
      colectivoId ? dependencies.obtenerColectivo(colectivoId, { signal }) : null,
    [colectivoId, dependencies],
  );
  const { datos, error, reintentar } = useAsync(obtener);

  if (!colectivoId) return NO_ES_COLECTIVO;
  if (error) return { ...SIN_SABER, error, reintentar };
  if (!datos) return SIN_SABER;
  return {
    esColectivo: true,
    esDueno: (datos.proyectos ?? []).some((proyecto) => proyecto.id === proyectoId),
  };
}
