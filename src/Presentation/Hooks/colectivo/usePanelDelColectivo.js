import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { filasDelPanel } from "@/Presentation/Formatos/datosDelPanel.js";
import { useColectivo } from "./useColectivo.js";
import { useProyectosDelColectivo } from "./useProyectosDelColectivo.js";

export function useDatosDelPanel(colectivoId) {
  const { colectivo, error: errorDeColectivo } = useColectivo(colectivoId);
  const { proyectos, error, recargar } = useProyectosDelColectivo(colectivoId);
  const [hoy] = useState(() => new Date());
  return {
    nombre: errorDeColectivo ? null : (colectivo?.nombre ?? null),
    proyectos,
    filas: filasDelPanel(proyectos, hoy),
    error,
    recargar,
  };
}

export function usePanelDelColectivo() {
  return useOutletContext();
}
