import { useCallback, useRef } from "react";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({ 409: "Tu cuenta ya tiene un perfil." });

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
      if (!registro.current) return;
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
      const { ok } = await registrarPerfil(request);
      if (!ok) return false;
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
