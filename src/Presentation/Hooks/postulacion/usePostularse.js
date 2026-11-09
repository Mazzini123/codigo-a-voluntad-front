import { useCallback } from "react";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const AVISO_POSTULADA = "Te postulaste. El colectivo va a revisar tu postulación.";
export const AVISO_ACEPTADA = "Listo: ya sos parte de este perfil.";

const PERFIL_CERRADO =
  "No pudimos registrar tu postulación. Puede que la búsqueda de este perfil ya haya cerrado.";
const MENSAJES = Object.freeze({
  400: PERFIL_CERRADO,
  409: "Ya te postulaste a este perfil.",
  422: PERFIL_CERRADO,
});

export function usePostularse(
  proyectoId,
  colaboradoraId,
  dependencies = colaboracionDependencies,
) {
  const avisar = useAvisos();
  const registrar = useCallback(
    (signal, perfil, esPublica) =>
      dependencies.registrarColaboracion(
        proyectoId,
        { colaboradorId: colaboradoraId, perfilId: perfil.id, esPublica },
        { signal },
      ),
    [proyectoId, colaboradoraId, dependencies],
  );
  const { ejecutar, enviando, error, reiniciar } = useMutacion(registrar, {
    mensajes: MENSAJES,
  });

  const postularse = useCallback(
    async (perfil, esPublica) => {
      const { ok, datos } = await ejecutar(perfil, esPublica);
      if (!ok) return null;
      avisar.exito(
        datos?.estado === COLABORACION_ESTADO.ACEPTADA ? AVISO_ACEPTADA : AVISO_POSTULADA,
      );
      return datos;
    },
    [ejecutar, avisar],
  );

  return { postularse, enviando, error, reiniciar };
}
