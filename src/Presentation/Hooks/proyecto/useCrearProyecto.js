import { useCallback, useMemo, useRef, useState } from "react";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";
import { VISIBILIDAD_DEL_BORRADOR } from "@/Presentation/Formatos/publicacion.js";
import { TERMINOS_CAMBIARON } from "@/Presentation/Formatos/terminos.js";
import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";

export const AVISO_PUBLICADO = "Publicaste el proyecto.";
export const AVISO_BORRADOR_GUARDADO = `Guardaste el borrador. ${VISIBILIDAD_DEL_BORRADOR}`;

export const MODO_DEL_ALTA = Object.freeze({
  PUBLICAR: "PUBLICAR",
  BORRADOR: "BORRADOR",
});

const DATOS_RECHAZADOS =
  "No pudimos publicar el proyecto. Revisá los datos que cargaste y probá de nuevo.";
const BORRADOR_RECHAZADO =
  "No pudimos guardar el borrador. Revisá los datos que cargaste y probá de nuevo.";
const MENSAJES = Object.freeze({
  400: DATOS_RECHAZADOS,
  422: DATOS_RECHAZADOS,
  [CODIGO_ERROR.TERMINOS_NO_ACEPTADOS]: TERMINOS_CAMBIARON,
});
const STATUS_DE_DATOS = Object.freeze([400, 422]);

function quedoIncierto(error) {
  return error.status == null || error.status === 408 || error.status >= 500;
}

function rechazoLosTerminos(error) {
  return error?.codigo === CODIGO_ERROR.TERMINOS_NO_ACEPTADOS;
}

function conModo(request, modo) {
  return modo === MODO_DEL_ALTA.BORRADOR ? { ...request, borrador: true } : request;
}

function errorDelModo(error, modo) {
  if (!error || modo !== MODO_DEL_ALTA.BORRADOR) return error;
  if (rechazoLosTerminos(error) || !STATUS_DE_DATOS.includes(error.status)) return error;
  return typeof error.conMensaje === "function"
    ? error.conMensaje(BORRADOR_RECHAZADO)
    : error;
}

export function useCrearProyecto(
  colectivoId,
  { alRechazarTerminos } = {},
  dependencies = proyectoDependencies,
) {
  const avisar = useAvisos();
  const [confirmandoNuevaVersion, setConfirmandoNuevaVersion] = useState(false);
  const [modo, setModo] = useState(MODO_DEL_ALTA.PUBLICAR);
  const registro = useRef(null);
  const crear = useCallback(
    (signal, request, claveIdempotencia) =>
      dependencies.crearProyecto(colectivoId, request, { signal, claveIdempotencia }),
    [colectivoId, dependencies],
  );
  const mutacion = useMutacion(crear, { mensajes: MENSAJES });
  const { enviando, ejecutar, reiniciar: reiniciarMutacion } = mutacion;

  const enviar = useCallback(
    async (request, modoPedido, { confirmarNuevaVersion = false } = {}) => {
      if (enviando) return false;

      if (!registro.current || registro.current.colectivoId !== colectivoId) {
        registro.current = { colectivoId, intentos: new Map() };
      }
      const { intentos } = registro.current;
      const pedido = conModo(request, modoPedido);
      const cuerpo = JSON.stringify(pedido);
      const anterior = intentos.get(cuerpo);
      setModo(modoPedido);
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
      const { ok, ignorada, error } = await ejecutar(pedido, intento.clave);
      if (ignorada) return false;
      if (!ok) {
        intento.incierto ||= quedoIncierto(error);
        if (rechazoLosTerminos(error)) alRechazarTerminos?.();
        return false;
      }
      avisar.exito(
        modoPedido === MODO_DEL_ALTA.BORRADOR ? AVISO_BORRADOR_GUARDADO : AVISO_PUBLICADO,
      );
      return true;
    },
    [colectivoId, enviando, ejecutar, avisar, alRechazarTerminos],
  );

  const publicar = useCallback(
    (request, opciones) => enviar(request, MODO_DEL_ALTA.PUBLICAR, opciones),
    [enviar],
  );
  const guardarBorrador = useCallback(
    (request, opciones) => enviar(request, MODO_DEL_ALTA.BORRADOR, opciones),
    [enviar],
  );

  const reiniciar = useCallback(() => {
    reiniciarMutacion();
    setConfirmandoNuevaVersion(false);
  }, [reiniciarMutacion]);

  const error = useMemo(() => errorDelModo(mutacion.error, modo), [mutacion.error, modo]);

  return {
    modo,
    publicando: enviando && modo === MODO_DEL_ALTA.PUBLICAR,
    guardandoBorrador: enviando && modo === MODO_DEL_ALTA.BORRADOR,
    error,
    proyecto: mutacion.datos,
    publicar,
    guardarBorrador,
    reiniciar,
    confirmandoNuevaVersion,
  };
}
