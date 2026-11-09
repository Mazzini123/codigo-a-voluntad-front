import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ContextoDeSesion } from "@/Presentation/Context/ContextoDeSesion.js";
import { authDependencies } from "@/Presentation/Dependencies/authDependencies.js";
import {
  proveedorDeIdentidad,
  PROVEEDOR_DE_IDENTIDAD,
  recordarVolverA,
  tomarVolverA,
  configuracionLogto,
  ProveedorDeSesionLogto,
} from "@/Presentation/Dependencies/identidadDependencies.js";
import {
  cambiarSesionHttp,
  configurarAuth,
  desconfigurarAuth,
  sesionHttpVigente,
} from "@/Presentation/Dependencies/httpDependencies.js";
import { useConsulta } from "@/Presentation/Hooks/comunes/useConsulta.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { RUTA_CALLBACK, RUTA_INICIO, RUTA_LOGIN } from "@/Presentation/Routes/rutas.js";
import { informarFalla } from "./informarFalla.js";

const AVISO_VENCIDA = "Tu sesión venció. Iniciá sesión de nuevo.";

class ErrorAlRecargarCuentaDelAlta extends Error {
  constructor(cause) {
    super("No pudimos actualizar tu cuenta", { cause });
  }
}

export function ProveedorDeSesion({
  identidad: identidadRecibida,
  dependencies: dependenciasRecibidas,
  children,
}) {
  const location = useLocation();
  const proveedor = identidadRecibida
    ? { identidad: identidadRecibida }
    : proveedorDeIdentidad;
  if (proveedor.tipo !== PROVEEDOR_DE_IDENTIDAD.LOGTO) {
    return (
      <ProveedorDeCuenta
        identidad={proveedor.identidad}
        dependencies={dependenciasRecibidas}
      >
        {children}
      </ProveedorDeCuenta>
    );
  }
  return (
    <ProveedorDeSesionLogto
      config={configuracionLogto}
      esCallback={location.pathname === RUTA_CALLBACK}
    >
      {(sesion) => (
        <ProveedorDeCuenta {...sesion} dependencies={dependenciasRecibidas}>
          {children}
        </ProveedorDeCuenta>
      )}
    </ProveedorDeSesionLogto>
  );
}

function ProveedorDeCuenta({
  identidad,
  claveSesionHttp = identidad,
  dependencies: dependenciasRecibidas,
  esperandoIdentidad = false,
  errorDeIngreso,
  callbackExterno,
  children,
}) {
  const dependencies = dependenciasRecibidas ?? authDependencies;
  const avisar = useAvisos();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const vencimientoAvisado = useRef(false);
  const manejarVencimiento = useRef(() => {});

  useLayoutEffect(() => {
    configurarAuth({
      clave: claveSesionHttp,
      obtenerToken: identidad.obtenerToken,
      alExpirar: () => manejarVencimiento.current(),
      permiteSinToken: identidad.simulada ? identidad.estaAutenticado : undefined,
    });
  }, [claveSesionHttp, identidad]);
  useLayoutEffect(() => {
    vencimientoAvisado.current = false;
    return () => desconfigurarAuth(claveSesionHttp);
  }, [claveSesionHttp]);

  const buscarCuenta = useCallback(
    async (signal, { desdeAlta = false } = {}) => {
      try {
        const autenticada =
          !vencimientoAvisado.current && (await identidad.estaAutenticado());
        const cuenta = autenticada
          ? await dependencies.obtenerCuentaActual({ signal })
          : null;
        return { cuenta };
      } catch (error) {
        if (desdeAlta) throw new ErrorAlRecargarCuentaDelAlta(error);
        throw error;
      }
    },
    [identidad, dependencies],
  );
  const { datos, error, cargando, ejecutar, reintentar } = useConsulta(buscarCuenta, {
    inmediato: !esperandoIdentidad && !callbackExterno,
  });
  const cuentaVerificada = datos?.cuenta ?? null;
  const falloDeRecargaDelAlta = error instanceof ErrorAlRecargarCuentaDelAlta;
  const falloDeCuenta = falloDeRecargaDelAlta ? error.cause : error;
  const conservarCuentaDelAlta = falloDeRecargaDelAlta && Boolean(cuentaVerificada);
  const errorDeCuenta = conservarCuentaDelAlta ? null : falloDeCuenta;
  const usuario = errorDeCuenta ? null : cuentaVerificada;
  const verificandoCuenta = cargando || (!datos && !error);

  useLayoutEffect(() => {
    manejarVencimiento.current = () => {
      if (vencimientoAvisado.current) return;
      vencimientoAvisado.current = true;
      avisar.info(AVISO_VENCIDA);
      void Promise.resolve()
        .then(() => identidad.olvidarSesion())
        .catch((falla) => informarFalla("No pudimos limpiar la sesión vencida", falla));
      void ejecutar().then((limpiada) => {
        if (limpiada) {
          navigate(RUTA_LOGIN, {
            replace: true,
            state: { desde: { pathname, search, hash } },
          });
        }
      });
    };
  }, [avisar, identidad, ejecutar, navigate, pathname, search, hash]);

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
      vencimientoAvisado.current = false;
      cambiarSesionHttp(claveSesionHttp, true);
      await ejecutar();
      return tomarVolverA();
    },
    [claveSesionHttp, identidad, ejecutar],
  );

  const asociarPerfil = useCallback(
    async (rol, perfilId) => {
      await identidad.asociarPerfil?.(rol, perfilId);
    },
    [identidad],
  );

  const cerrarSesion = useCallback(async () => {
    recordarVolverA(null);
    const generacion = cambiarSesionHttp(claveSesionHttp, false);
    try {
      await identidad.cerrarSesion();
    } catch (falla) {
      informarFalla("No pudimos cerrar la sesión", falla);
      if (sesionHttpVigente(generacion)) {
        cambiarSesionHttp(claveSesionHttp, true);
        avisar.error("No pudimos cerrar tu sesión. Probá de nuevo.");
      }
      return;
    }
    await ejecutar();
    navigate(RUTA_INICIO, { replace: true, flushSync: true });
  }, [avisar, claveSesionHttp, identidad, ejecutar, navigate]);

  const sesion = useMemo(
    () => ({
      usuario,
      sesionSimulada: identidad.simulada ?? null,
      ingresoSinConfigurar: identidad.sinConfigurar === true,
      estaAutenticado: Boolean(usuario),
      cargando: esperandoIdentidad || (verificandoCuenta && !usuario),
      errorDeCuenta,
      errorDeIngreso,
      callbackExterno,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      asociarPerfil,
      recargarCuenta: ejecutar,
      reintentarCuenta: reintentar,
    }),
    [
      usuario,
      identidad,
      verificandoCuenta,
      esperandoIdentidad,
      errorDeCuenta,
      errorDeIngreso,
      callbackExterno,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      asociarPerfil,
      ejecutar,
      reintentar,
    ],
  );

  return <ContextoDeSesion.Provider value={sesion}>{children}</ContextoDeSesion.Provider>;
}
