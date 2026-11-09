import { LogtoProvider, useHandleSignInCallback, useLogto } from "@logto/react";
import { useEffect, useMemo, useState } from "react";

const ESPERA_DE_CALLBACK_MS = 1000;

export function ProveedorDeSesionLogto({ config, esCallback, children }) {
  return (
    <LogtoProvider config={config}>
      <SesionLogto recurso={config.resources[0]} esCallback={esCallback}>
        {children}
      </SesionLogto>
    </LogtoProvider>
  );
}

function SesionLogto({ recurso, esCallback, children }) {
  const {
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    getAccessToken,
    clearAllTokens,
  } = useLogto();
  const [inicializado, setInicializado] = useState(false);
  if (!inicializado && !isLoading) setInicializado(true);
  const claveSesionHttp = useMemo(
    () => ({ autenticada: isAuthenticated }),
    [isAuthenticated],
  );

  const identidad = useMemo(
    () =>
      crearPuenteDeSesion({
        isAuthenticated,
        signIn,
        signOut,
        getAccessToken,
        clearAllTokens,
        recurso,
      }),
    [isAuthenticated, signIn, signOut, getAccessToken, clearAllTokens, recurso],
  );
  const sesion = {
    identidad,
    claveSesionHttp,
    esperandoIdentidad: !inicializado,
    errorDeIngreso: error,
  };

  if (esCallback) {
    return (
      <CallbackLogto>
        {(callbackExterno) =>
          children({
            ...sesion,
            esperandoIdentidad: sesion.esperandoIdentidad || !callbackExterno.listo,
            callbackExterno,
          })
        }
      </CallbackLogto>
    );
  }
  return children(sesion);
}

function crearPuenteDeSesion({
  isAuthenticated,
  signIn,
  signOut,
  getAccessToken,
  clearAllTokens,
  recurso,
}) {
  let autenticado = isAuthenticated;
  return {
    estaAutenticado: async () => autenticado,
    iniciarSesion: ({ registro = false } = {}) =>
      signIn({
        redirectUri: `${window.location.origin}/callback`,
        firstScreen: registro ? "register" : "signIn",
      }),
    async completarIngreso() {},
    obtenerToken: async () =>
      autenticado ? ((await getAccessToken(recurso)) ?? null) : null,
    async cerrarSesion() {
      await signOut(`${window.location.origin}/`);
      await clearAllTokens();
      autenticado = false;
    },
    async olvidarSesion() {
      await clearAllTokens();
      autenticado = false;
    },
  };
}

function CallbackLogto({ children }) {
  const [procesado, setProcesado] = useState(false);
  const [sinRespuesta, setSinRespuesta] = useState(false);
  const { isLoading, error } = useHandleSignInCallback(() => setProcesado(true));
  const parametros = new URLSearchParams(window.location.search);
  const incompleto = !parametros.has("code") || !parametros.has("state");

  useEffect(() => {
    if (procesado || isLoading || error || incompleto) return undefined;
    const espera = setTimeout(() => setSinRespuesta(true), ESPERA_DE_CALLBACK_MS);
    return () => clearTimeout(espera);
  }, [procesado, isLoading, error, incompleto]);

  return children({
    listo: procesado,
    fallo: !procesado && (Boolean(error) || sinRespuesta || (!isLoading && incompleto)),
  });
}
