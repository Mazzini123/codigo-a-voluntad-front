import { LogtoCallback } from "./logto/LogtoCallback.jsx";
import { LogtoSesionProvider } from "./logto/LogtoSesionProvider.jsx";
import { useSesionLogto } from "./logto/useSesionLogto.js";
import { crearSesionSimulada } from "./simulada/crearSesionSimulada.js";
import { SinConfigurarCallback } from "./SinConfigurarCallback.jsx";
import { SinProveedor } from "./SinProveedor.jsx";
import { avisarSinConfigurar, useSesionSinConfigurar } from "./sinConfigurar.js";
import { elegirProveedorDeAuth, PROVEEDOR_DE_AUTH } from "./elegirProveedorDeAuth.js";

export function obtenerConfiguracionAuth(entorno = import.meta.env) {
  const elegido = elegirProveedorDeAuth(entorno);
  switch (elegido.tipo) {
    case PROVEEDOR_DE_AUTH.LOGTO:
      return {
        tipo: elegido.tipo,
        Provider: LogtoSesionProvider,
        usarSesion: useSesionLogto,
        CallbackComponent: LogtoCallback,
      };
    case PROVEEDOR_DE_AUTH.SIMULADA: {
      const simulada = crearSesionSimulada(elegido.simulada);
      return {
        tipo: elegido.tipo,
        Provider: SinProveedor,
        usarSesion: simulada.usarSesion,
        CallbackComponent: simulada.CallbackComponent,
      };
    }
    default:
      if (entorno.DEV && entorno.MODE !== "test") avisarSinConfigurar();
      return {
        tipo: PROVEEDOR_DE_AUTH.SIN_CONFIGURAR,
        Provider: SinProveedor,
        usarSesion: useSesionSinConfigurar,
        CallbackComponent: SinConfigurarCallback,
      };
  }
}
