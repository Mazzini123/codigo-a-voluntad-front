import { useCallback } from "react";
import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { colaboracionDependencies } from "@/Presentation/Dependencies/colaboracionDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const AVISO_POSTULADA = "Te postulaste. El colectivo va a revisar tu postulación.";
export const AVISO_ACEPTADA = "Listo: ya sos parte de este perfil.";

const NO_REGISTRADA =
  "No pudimos registrar tu postulación. Actualizá la página y revisá que el perfil siga recibiendo postulaciones.";
const MENSAJE_COLECTIVO_PROPIO =
  "Sos parte de este colectivo, así que no podés postularte a sus proyectos.";
// El código del back dice el motivo exacto; el estado HTTP solo queda como respaldo.
export const MENSAJES_DE_POSTULACION = Object.freeze({
  400: NO_REGISTRADA,
  409: NO_REGISTRADA,
  422: NO_REGISTRADA,
  [CODIGO_ERROR.POSTULACION_EN_COLECTIVO_PROPIO]: MENSAJE_COLECTIVO_PROPIO,
  [CODIGO_ERROR.HABILIDADES_REQUERIDAS_FALTANTES]:
    "No podés postularte: tu perfil no tiene todas las habilidades requeridas de este perfil. Podés sumarlas desde tu perfil de colaboradora.",
  [CODIGO_ERROR.BUSQUEDA_CERRADA]: "La búsqueda de este perfil ya cerró.",
  [CODIGO_ERROR.PROYECTO_FINALIZADO]:
    "Este proyecto ya finalizó y no recibe postulaciones.",
  [CODIGO_ERROR.POSTULACION_EXISTENTE]: "Ya te postulaste a este perfil.",
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
    mensajes: MENSAJES_DE_POSTULACION,
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
