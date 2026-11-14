import { useCallback, useRef } from "react";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({ 409: "Tu cuenta ya tiene un perfil." });
const YA_TIENE_PERFIL = 409;
const ERROR_DEL_SERVIDOR = 500;

function pudoHaberseCreado(error) {
  if (!error) return false;
  return (
    !error.status ||
    error.status === YA_TIENE_PERFIL ||
    error.status >= ERROR_DEL_SERVIDOR
  );
}

export function useAltaDePerfil({ crearPerfil, rol, mensaje }) {
  const { usuario, recargarCuenta } = useAuth();
  const avisar = useAvisos();
  const registro = useRef(null);

  const registrar = useCallback(
    (signal, request) => crearPerfil(request, { signal }),
    [crearPerfil],
  );
  const alta = useMutacion(registrar, { mensajes: MENSAJES });

  const sincronizar = useCallback(
    async (signal) => {
      if (!signal.aborted) await recargarCuenta({ desdeAlta: true });
    },
    [recargarCuenta],
  );
  const cuenta = useMutacion(sincronizar);
  const { ejecutar: registrarPerfil } = alta;
  const { ejecutar: actualizarCuenta } = cuenta;

  const crear = useCallback(
    async (request) => {
      if (registro.current) return false;
      const { ok, error } = await registrarPerfil(request);
      if (!ok) {
        if (pudoHaberseCreado(error)) await actualizarCuenta();
        return false;
      }
      registro.current = true;
      avisar.exito(mensaje);
      await actualizarCuenta();
      return true;
    },
    [registrarPerfil, actualizarCuenta, avisar, mensaje],
  );

  const perfilCreado = alta.datos;
  const perfilConfirmado =
    !perfilCreado || (usuario?.rol === rol && usuario.perfilId === perfilCreado.id);
  const rolConfirmado = perfilConfirmado ? usuario?.rol : null;

  return {
    crear,
    creando: alta.enviando,
    error: alta.error,
    perfilCreado,
    actualizarCuenta,
    actualizando: cuenta.enviando,
    rolConfirmado,
  };
}
