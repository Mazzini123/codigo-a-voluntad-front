import { useCallback } from "react";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { useAuth } from "./useAuth.js";

export function useNombreDeUsuario() {
  const { cambiarNombre } = useAuth();
  const tarea = useCallback((_signal, nombre) => cambiarNombre(nombre), [cambiarNombre]);
  return useMutacion(tarea);
}
