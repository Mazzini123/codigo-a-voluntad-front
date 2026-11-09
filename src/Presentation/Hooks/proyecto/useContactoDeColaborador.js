import { useCallback, useMemo } from "react";
import { colaboradorDependencies } from "@/Presentation/Dependencies/colaboradorDependencies.js";
import { proyectoDependencies } from "@/Presentation/Dependencies/proyectoDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import {
  MENSAJE_NO_ENCONTRADA,
  MENSAJE_SIN_ACCESO,
} from "@/Presentation/Formatos/contacto.js";

const DEPENDENCIAS = Object.freeze({
  proyectos: proyectoDependencies,
  colaboradores: colaboradorDependencies,
});

const MENSAJES = Object.freeze({
  403: MENSAJE_SIN_ACCESO,
  404: MENSAJE_NO_ENCONTRADA,
});

function conMensajePropio(error) {
  const mensaje = MENSAJES[error?.status];
  return mensaje && typeof error.conMensaje === "function"
    ? error.conMensaje(mensaje)
    : error;
}

export function useContactoDeColaborador(
  proyectoId,
  colaboradorId,
  dependencias = DEPENDENCIAS,
) {
  const consultarContacto = useCallback(
    (signal) =>
      dependencias.proyectos.obtenerContactoDeColaborador(proyectoId, colaboradorId, {
        signal,
      }),
    [proyectoId, colaboradorId, dependencias],
  );
  const consultarNombre = useCallback(
    (signal) => dependencias.colaboradores.obtenerColaborador(colaboradorId, { signal }),
    [colaboradorId, dependencias],
  );
  const contacto = useConsulta(consultarContacto);
  const persona = useConsulta(consultarNombre);
  const error = useMemo(() => conMensajePropio(contacto.error), [contacto.error]);

  return {
    medios: contacto.datos,
    colaboradora: persona.datos,
    error,
    cargando: contacto.cargando && !contacto.datos,
    reintentar: contacto.reintentar,
  };
}
