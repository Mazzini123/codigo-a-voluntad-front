import { useCallback } from 'react';
import { useLogto } from '@logto/react';
import { logtoConfig, urlDeCallback, urlDeSalida } from './logtoConfig';

export function useSesionLogto() {
  const { isAuthenticated, isLoading, signIn, signOut, getAccessToken } = useLogto();
  const [recursoApi] = logtoConfig.resources;

  const iniciar = useCallback(() => signIn(urlDeCallback), [signIn]);
  const cerrar = useCallback(() => signOut(urlDeSalida), [signOut]);
  const obtenerToken = useCallback(
    () => getAccessToken(recursoApi),
    [getAccessToken, recursoApi]
  );

  return {
    autenticado: isAuthenticated,
    cargando: isLoading,
    iniciar,
    cerrar,
    obtenerToken,
  };
}