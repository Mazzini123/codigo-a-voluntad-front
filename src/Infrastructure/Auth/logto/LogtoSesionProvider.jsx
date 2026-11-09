import { LogtoProvider } from "@logto/react";
import { logtoConfig } from "./logtoConfig.js";

export function LogtoSesionProvider({ children }) {
  return <LogtoProvider config={logtoConfig}>{children}</LogtoProvider>;
}
