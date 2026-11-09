import { useCallback, useRef, useState } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

export const AVISO_PUBLICADO = "Publicaste el proyecto.";

const DATOS_RECHAZADOS =
  "No pudimos publicar el proyecto. Revisá los datos que cargaste y probá de nuevo.";
const MENSAJES = Object.freeze({ 400: DATOS_RECHAZADOS, 422: DATOS_RECHAZADOS });

function quedoIncierto(error) {
  return error.status == null || error.status === 408 || error.status >= 500;
}

export function useCrearProyecto(colectivoId, dependencies = proyectoDependencies) {
  const avisar = useAvisos();
  const [confirmandoNuevaVersion, setConfirmandoNuevaVersion] = useState(false);
  const registro = useRef(null);
  const crear = useCallback(
    (signal, request, claveIdempotencia) =>
      dependencies.crearProyecto(colectivoId, request, { signal, claveIdempotencia }),
    [colectivoId, dependencies],
  );
  const mutacion = useMutacion(crear, { mensajes: MENSAJES });
  const { enviando, ejecutar, reiniciar: reiniciarMutacion } = mutacion;

  const publicar = useCallback(
    async (request, { confirmarNuevaVersion = false } = {}) => {
      if (enviando) return false;

      if (!registro.current || registro.current.colectivoId !== colectivoId) {
        registro.current = { colectivoId, intentos: new Map() };
      }
      const { intentos } = registro.current;
      const cuerpo = JSON.stringify(request);
      const anterior = intentos.get(cuerpo);
      if (
        !confirmarNuevaVersion &&
        !anterior?.incierto &&
        [...intentos.values()].some(({ incierto }) => incierto)
      ) {
        setConfirmandoNuevaVersion(true);
        return false;
      }

      const intento = anterior ?? { clave: crypto.randomUUID(), incierto: false };
      intentos.set(cuerpo, intento);
      setConfirmandoNuevaVersion(false);
      const { ok, ignorada, error } = await ejecutar(request, intento.clave);
      if (ignorada) return false;
      if (!ok) {
        intento.incierto ||= quedoIncierto(error);
        return false;
      }
      avisar.exito(AVISO_PUBLICADO);
      return true;
    },
    [colectivoId, enviando, ejecutar, avisar],
  );

  const reiniciar = useCallback(() => {
    reiniciarMutacion();
    setConfirmandoNuevaVersion(false);
  }, [reiniciarMutacion]);

  return {
    publicando: enviando,
    error: mutacion.error,
    proyecto: mutacion.datos,
    publicar,
    reiniciar,
    confirmandoNuevaVersion,
  };
}
