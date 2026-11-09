import { useCallback, useRef } from "react";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMutacion } from "@/Presentation/Hooks/comunes/useMutacion.js";

const MENSAJES = Object.freeze({ 409: "Tu cuenta ya tiene un perfil." });

export function useAltaDePerfil({ crearPerfil, rol, mensaje }) {
  const { usuario, asociarPerfil, recargarCuenta } = useAuth();
  const avisar = useAvisos();
  const registro = useRef(null);

  const registrar = useCallback(
    (signal, request) => crearPerfil(request, { signal }),
    [crearPerfil],
  );
  const alta = useMutacion(registrar, { mensajes: MENSAJES });

  const sincronizar = useCallback(
    async (signal) => {
      const perfil = registro.current;
      if (!perfil) return;
      if (!perfil.asociado) {
        await asociarPerfil(rol, perfil.id);
        perfil.asociado = true;
      }
      if (!signal.aborted) await recargarCuenta({ desdeAlta: true });
    },
    [rol, asociarPerfil, recargarCuenta],
  );
  const cuenta = useMutacion(sincronizar);
  const { ejecutar: registrarPerfil } = alta;
  const { ejecutar: actualizarCuenta } = cuenta;

  const crear = useCallback(
    async (request) => {
      if (registro.current) return false;
      const { ok, datos } = await registrarPerfil(request);
      if (!ok) return false;
      registro.current = { id: datos.id, asociado: false };
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
