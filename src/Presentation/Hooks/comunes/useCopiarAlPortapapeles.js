import { useCallback } from "react";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";

export function useCopiarAlPortapapeles(mensajeDeFalla) {
  const avisar = useAvisos();
  return useCallback(
    async (texto, mensajeDeExito) => {
      try {
        await navigator.clipboard.writeText(texto);
      } catch {
        avisar.error(mensajeDeFalla);
        return false;
      }
      avisar.exito(mensajeDeExito);
      return true;
    },
    [avisar, mensajeDeFalla],
  );
}
