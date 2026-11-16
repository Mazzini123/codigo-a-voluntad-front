import { useCallback } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { BLOQUEO_EN_REVISION } from "@/Presentation/Formatos/publicacion.js";

export const AVISO_PUBLICACION_PEDIDA = `Pediste la publicación. ${BLOQUEO_EN_REVISION}`;

const MENSAJES = Object.freeze({
  409: "Este proyecto ya no es un borrador. Actualizamos su estado.",
  422: "La fecha de cierre ya pasó. Cambiala en el borrador y volvé a pedir la publicación.",
});

export function usePedirPublicacion(
  proyectoId,
  alCambiar,
  dependencies = proyectoDependencies,
) {
  const avisar = useAvisos();
  const tarea = useCallback(
    (signal) => dependencies.pedirPublicacion(proyectoId, { signal }),
    [proyectoId, dependencies],
  );
  const { enviando, error, ejecutar, reiniciar } = useMutacion(tarea, {
    mensajes: MENSAJES,
  });

  const pedir = useCallback(async () => {
    const resultado = await ejecutar();
    if (resultado.ignorada) return false;
    if (resultado.ok) avisar.exito(AVISO_PUBLICACION_PEDIDA);
    if (resultado.ok || resultado.error?.status === 409) await alCambiar?.();
    return resultado.ok;
  }, [ejecutar, avisar, alCambiar]);

  return { pidiendo: enviando, error, pedir, limpiar: reiniciar };
}
