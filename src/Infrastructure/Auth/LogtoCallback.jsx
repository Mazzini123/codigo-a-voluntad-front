import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

export function LogtoCallback() {
  const navigate = useNavigate();
  const { isLoading } = useHandleSignInCallback(() => {
    navigate('/', { replace: true });
  });

  return isLoading ? <p role="status">Iniciando sesión...</p> : null;
}