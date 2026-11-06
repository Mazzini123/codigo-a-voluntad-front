import { LogtoProvider } from '@logto/react';
import { logtoConfig } from './logtoConfig';

export function LogtoSesionProvider({ children }) {
  return <LogtoProvider config={logtoConfig}>{children}</LogtoProvider>;
}