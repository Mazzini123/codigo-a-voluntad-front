import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSesionLogto } from '../../Infrastructure/Auth/useSesionLogto';
import { configurarAuth } from '../../Infrastructure/Http/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children, usarSesion = useSesionLogto }) {
  const sesion = usarSesion();
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);

  // Sincroniza el token con el interceptor de Axios
  useEffect(() => {
    configurarAuth({
      obtenerToken: sesion.obtenerToken,
      alExpirar: sesion.cerrar,
    });
  }, [sesion.obtenerToken, sesion.cerrar]);

  // Consulta al backend cuando la sesión de Logto está activa
  useEffect(() => {
    if (!sesion.autenticado) {
      setUsuario(null);
      return;
    }

    setCargandoUsuario(true);
    // Aquí en el futuro llamarán a su endpoint /auth/me
    // Ejemplo: buscarUsuarioActual().then(setUsuario).finally(() => setCargandoUsuario(false));
    setCargandoUsuario(false);
  }, [sesion.autenticado]);

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: Boolean(usuario || sesion.autenticado),
      cargando: sesion.cargando || cargandoUsuario,
      iniciarSesion: sesion.iniciarSesion,
      cerrarSesion: sesion.cerrarSesion,
    }),
    [usuario, sesion.autenticado, sesion.cargando, cargandoUsuario, sesion.iniciarSesion, sesion.cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);