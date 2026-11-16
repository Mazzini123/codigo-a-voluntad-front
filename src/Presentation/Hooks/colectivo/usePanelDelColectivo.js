import { usePagina } from "@/Presentation/Hooks/comunes/usePagina.js";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { filasDelPanel } from "@/Presentation/Formatos/datosDelPanel.js";
import { useColectivo } from "./useColectivo.js";
import { usePublicacionesSinPublicar } from "@/Presentation/Hooks/proyecto/usePublicacionesSinPublicar.js";
import { useProyectosDelColectivo } from "./useProyectosDelColectivo.js";

function conPublicaciones(proyectos, publicaciones) {
  return proyectos?.map((proyecto) =>
    publicaciones.has(proyecto.id)
      ? { ...proyecto, ...publicaciones.get(proyecto.id) }
      : proyecto,
  );
}

export function useDatosDelPanel(colectivoId) {
  const { colectivo, error: errorDeColectivo } = useColectivo(colectivoId);
  const paginacionProyectos = useProyectosDelColectivo(colectivoId);
  const { error, recargar } = paginacionProyectos;
  const publicaciones = usePublicacionesSinPublicar(paginacionProyectos.proyectos);
  const proyectos = conPublicaciones(paginacionProyectos.proyectos, publicaciones);
  const listarPendientes = useCallback(
    (query, signal) =>
      colaboracionDependencies.listarPendientesDeColectivo(colectivoId, {
        ...query,
        signal,
      }),
    [colectivoId],
  );
  const postulacionesRecibidas = usePagina(listarPendientes);
  const [hoy] = useState(() => new Date());
  return {
    nombre: errorDeColectivo ? null : (colectivo?.nombre ?? null),
    proyectos,
    paginacionProyectos,
    postulacionesRecibidas,
    filas: filasDelPanel(proyectos, hoy),
    error,
    recargar,
  };
}

export function usePanelDelColectivo() {
  return useOutletContext();
}
