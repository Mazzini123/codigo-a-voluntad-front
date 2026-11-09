import { useCallback, useState } from "react";
import { useLogto } from "@logto/react";
import { RUTA_CALLBACK } from "../authRoutes.js";
import { logtoConfig } from "./logtoConfig.js";

export function useSesionLogto() {
  const {
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    getAccessToken,
    clearAllTokens,
  } = useLogto();
  const [recursoApi] = logtoConfig.resources;
  const [inicializado, setInicializado] = useState(false);
  if (!inicializado && !isLoading) setInicializado(true);

  const iniciar = useCallback(
    ({ registro = false } = {}) =>
      signIn({
        redirectUri: `${window.location.origin}${RUTA_CALLBACK}`,
        firstScreen: registro ? "register" : "signIn",
      }),
    [signIn],
  );
  const limpiar = useCallback(() => clearAllTokens(), [clearAllTokens]);
  const cerrar = useCallback(async () => {
    await signOut(`${window.location.origin}/`);
    await clearAllTokens();
  }, [signOut, clearAllTokens]);
  const obtenerToken = useCallback(
    async () => (await getAccessToken(recursoApi)) ?? null,
    [getAccessToken, recursoApi],
  );

  return {
    autenticado: isAuthenticated,
    cargando: !inicializado,
    error: error ?? null,
    iniciar,
    cerrar,
    limpiar,
    obtenerToken,
  };
}
