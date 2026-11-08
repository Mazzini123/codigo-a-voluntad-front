import { LogtoSesionProvider } from './logto/LogtoSesionProvider';
import { useSesionLogto } from './logto/useSesionLogto';
import { LogtoCallback } from './logto/LogtoCallback';

// (En el futuro, si cambian de proveedor, solo importan el nuevo aquí)
// import { FirebaseSesionProvider } from './firebase/FirebaseSesionProvider';
// import { useSesionFirebase } from './firebase/useSesionFirebase';
// import { FirebaseCallback } from './firebase/FirebaseCallback';

// En el .env se define el proveedor a usar
const PROVEEDOR_ACTIVO = import.meta.env.VITE_AUTH_PROVIDER || 'logto'; // Por ahora por defecto logto, dsp puede haber uno simulado

/*
 Factory que selecciona el proveedor de autenticación 
 basándose en la configuración del entorno, manteniendo la aplicación 
 100% agnóstica a la tecnología elegida.
*/
export function obtenerConfiguracionAuth() {
  switch (PROVEEDOR_ACTIVO) {
    case 'logto':
      return {
        Provider: LogtoSesionProvider,
        usarSesion: useSesionLogto,
        CallbackComponent: LogtoCallback,
      };
      
    // Ejemplo de integracion con otro proveedor
    // case 'firebase':
    //   return {
    //     Provider: FirebaseSesionProvider,
    //     usarSesion: useSesionFirebase,
    //     CallbackComponent: FirebaseCallback,
    //   };

    default:
      throw new Error(`Proveedor de autenticación no soportado: ${PROVEEDOR_ACTIVO}`);
  }
}