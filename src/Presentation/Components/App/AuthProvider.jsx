import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext.js";
import { authDependencies } from "../../Dependencies/authDependencies.js";
import {
  identidad as identidadPorDefecto,
  recordarVolverA,
  tomarVolverA,
  configuracionLogto,
  SesionLogtoProvider,
} from "../../Dependencies/identidadDependencies.js";
import { configurarAuth } from "../../Dependencies/httpDependencies.js";
import { useAsync } from "../../Hooks/useAsync.js";
import { useAvisos } from "../../Hooks/useAvisos.js";
import { ErrorState } from "./ErrorState.jsx";
import estilos from "./AuthProvider.module.css";

const AVISO_VENCIDA = "Tu sesión venció. Iniciá sesión de nuevo.";

export function AuthProvider({
  identidad: identidadRecibida,
  dependencies: dependenciasRecibidas,
  children,
}) {
  const location = useLocation();
  const identidad = identidadRecibida ?? identidadPorDefecto;
  if (identidad) {
    return (
      <ProveedorDeCuenta identidad={identidad} dependencies={dependenciasRecibidas}>
        {children}
      </ProveedorDeCuenta>
    );
  }
  return (
    <SesionLogtoProvider
      config={configuracionLogto}
      esCallback={location.pathname === "/callback"}
    >
      {(sesion) => (
        <ProveedorDeCuenta {...sesion} dependencies={dependenciasRecibidas}>
          {children}
        </ProveedorDeCuenta>
      )}
    </SesionLogtoProvider>
  );
}

function ProveedorDeCuenta({
  identidad,
  dependencies: dependenciasRecibidas,
  esperandoIdentidad = false,
  errorDeIngreso,
  callbackExterno,
  children,
}) {
  const dependencies = dependenciasRecibidas ?? authDependencies;
  const avisar = useAvisos();
  const navigate = useNavigate();
  const vencimientoAvisado = useRef(false);
  const manejarVencimiento = useRef(() => {});

  useLayoutEffect(() => {
    configurarAuth({
      obtenerToken: identidad.obtenerToken,
      alExpirar: () => manejarVencimiento.current(),
    });
    return () => configurarAuth();
  }, [identidad]);

  const buscarCuenta = useCallback(
    async (signal) => {
      if (!(await identidad.estaAutenticado())) return null;
      return dependencies.obtenerCuentaActual({ signal });
    },
    [identidad, dependencies],
  );
  const { datos, error, cargando, ejecutar } = useAsync(buscarCuenta, {
    inmediato: !esperandoIdentidad && !callbackExterno,
  });
  const sesionVencida = error?.status === 401;
  const usuario = sesionVencida ? null : datos;

  useEffect(() => {
    if (usuario) vencimientoAvisado.current = false;
  }, [usuario]);

  useEffect(() => {
    manejarVencimiento.current = () => {
      if (vencimientoAvisado.current) return;
      vencimientoAvisado.current = true;
      const { pathname, search, hash } = window.location;
      avisar.info(AVISO_VENCIDA);
      identidad.olvidarSesion().finally(() => ejecutar());
      navigate("/login", { replace: true, state: { desde: { pathname, search, hash } } });
    };
  }, [avisar, identidad, ejecutar, navigate]);

  const iniciarSesion = useCallback(
    ({ desde = null, registro = false } = {}) => {
      recordarVolverA(desde);
      return identidad.iniciarSesion({ registro });
    },
    [identidad],
  );

  const completarIngreso = useCallback(
    async (url) => {
      await identidad.completarIngreso(url);
      await ejecutar();
      return tomarVolverA();
    },
    [identidad, ejecutar],
  );

  const asociarPerfil = useCallback(
    async (rol, perfilId) => {
      await identidad.asociarPerfil?.(rol, perfilId);
    },
    [identidad],
  );

  const cerrarSesion = useCallback(async () => {
    recordarVolverA(null);
    await identidad.cerrarSesion();
    await ejecutar();
    navigate("/", { replace: true, flushSync: true });
  }, [identidad, ejecutar, navigate]);

  const sesion = useMemo(
    () => ({
      usuario,
      sesionSimulada: identidad.simulada ?? null,
      ingresoSinConfigurar: identidad.sinConfigurar === true,
      estaAutenticado: Boolean(usuario),
      cargando: esperandoIdentidad || (cargando && !usuario),
      errorDeIngreso,
      callbackExterno,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      asociarPerfil,
      recargarCuenta: ejecutar,
    }),
    [
      usuario,
      identidad,
      cargando,
      esperandoIdentidad,
      errorDeIngreso,
      callbackExterno,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      asociarPerfil,
      ejecutar,
    ],
  );

  if (error && !sesionVencida) {
    return (
      <main className={estilos.error}>
        <ErrorState
          nivel={1}
          titulo="No pudimos verificar tu sesión"
          error={error}
          alReintentar={() => ejecutar()}
        />
      </main>
    );
  }

  return <AuthContext.Provider value={sesion}>{children}</AuthContext.Provider>;
}
