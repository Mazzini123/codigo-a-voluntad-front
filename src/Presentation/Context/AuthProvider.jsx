import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { obtenerConfiguracionAuth } from '../../Infrastructure/Auth/authFactory';
import { configurarAuth } from '../../Infrastructure/Http/axiosClient';

const AuthContext = createContext(null);

const { usarSesion: usarSesionPorDefecto } = obtenerConfiguracionAuth();

export function AuthProvider({ children, usarSesion = usarSesionPorDefecto }) {
  const sesion = usarSesion();
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);

  useEffect(() => {
    configurarAuth({
      obtenerToken: sesion.obtenerToken,
      alExpirar: sesion.cerrar,
    });
  }, [sesion.obtenerToken, sesion.cerrar]);

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
      iniciarSesion: sesion.iniciar,
      cerrarSesion: sesion.cerrar,
      obtenerToken: sesion.obtenerToken,
    }),
    [usuario, sesion.autenticado, sesion.cargando, cargandoUsuario, sesion.iniciar, sesion.cerrar, sesion.obtenerToken]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);