import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { informarFalla } from "@/Presentation/Components/App/sesion/informarFalla.js";
import { ContextoDeSesion } from "@/Presentation/Context/ContextoDeSesion.js";
import { authDependencies } from "@/Presentation/Dependencies/authDependencies.js";
import {
  configuracionAuth,
  recordarVolverA,
  tomarVolverA,
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

const AVISO_VENCIDA = "Tu sesión venció. Iniciá sesión de nuevo.";

class ErrorAlRecargarCuentaDelAlta extends Error {
  constructor(cause) {
    super("No pudimos actualizar tu cuenta", { cause });
  }
}

export function AuthProvider({
  usarSesion = configuracionAuth.usarSesion,
  CallbackComponent = configuracionAuth.CallbackComponent,
  dependencies: dependenciasRecibidas,
  children,
}) {
  const sesion = usarSesion();
  const [perfilDadoDeBaja, setPerfilDadoDeBaja] = useState(false);
  const {
    autenticado,
    cargando: esperandoIdentidad = false,
    error: errorDeIngreso = null,
    iniciar,
    cerrar,
    limpiar,
    obtenerToken: tokenDelProveedor,
    asociarPerfil: asociarEnElProveedor,
    simulada = null,
    sinConfigurar = false,
  } = sesion;
  const dependencies = dependenciasRecibidas ?? authDependencies;
  const avisar = useAvisos();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const enCallback = pathname === RUTA_CALLBACK;
  const vencimientoAvisado = useRef(false);
  const manejarVencimiento = useRef(() => {});
  const descartada = useRef(false);
  const actual = useRef({ autenticado, tokenDelProveedor });
  const claveSesionHttp = useMemo(() => ({ autenticada: autenticado }), [autenticado]);

  useLayoutEffect(() => {
    actual.current = { autenticado, tokenDelProveedor };
  });

  const estaAutenticada = useCallback(
    async () => !descartada.current && actual.current.autenticado,
    [],
  );
  const obtenerToken = useCallback(async () => {
    if (descartada.current || !actual.current.autenticado) return null;
    return (await actual.current.tokenDelProveedor()) ?? null;
  }, []);

  useLayoutEffect(() => {
    configurarAuth({
      clave: claveSesionHttp,
      obtenerToken,
      alExpirar: () => manejarVencimiento.current(),
      permiteSinToken: simulada ? estaAutenticada : undefined,
    });
  }, [claveSesionHttp, obtenerToken, estaAutenticada, simulada]);
  useLayoutEffect(() => {
    vencimientoAvisado.current = false;
    return () => desconfigurarAuth(claveSesionHttp);
  }, [claveSesionHttp]);

  const buscarCuenta = useCallback(
    async (signal, { desdeAlta = false } = {}) => {
      try {
        const autenticada =
          !vencimientoAvisado.current && !descartada.current && autenticado;
        const cuenta = autenticada
          ? await dependencies.obtenerCuentaActual({ signal })
          : null;
        return { cuenta };
      } catch (error) {
        if (desdeAlta) throw new ErrorAlRecargarCuentaDelAlta(error);
        throw error;
      }
    },
    [autenticado, dependencies],
  );
  const { datos, error, cargando, ejecutar, reintentar } = useConsulta(buscarCuenta, {
    inmediato: !esperandoIdentidad && !enCallback,
  });
  const cuentaVerificada = datos?.cuenta ?? null;
  const falloDeRecargaDelAlta = error instanceof ErrorAlRecargarCuentaDelAlta;
  const falloDeCuenta = falloDeRecargaDelAlta ? error.cause : error;
  const conservarCuentaDelAlta = falloDeRecargaDelAlta && Boolean(cuentaVerificada);
  const errorDeCuenta = conservarCuentaDelAlta || perfilDadoDeBaja ? null : falloDeCuenta;
  const usuarioSinBaja = errorDeCuenta ? null : cuentaVerificada;
  const usuario = useMemo(
    () =>
      perfilDadoDeBaja && usuarioSinBaja
        ? { ...usuarioSinBaja, rol: null, perfilId: null }
        : usuarioSinBaja,
    [perfilDadoDeBaja, usuarioSinBaja],
  );
  const verificandoCuenta = cargando || (!datos && !error);

  useLayoutEffect(() => {
    manejarVencimiento.current = () => {
      if (vencimientoAvisado.current) return;
      vencimientoAvisado.current = true;
      avisar.info(AVISO_VENCIDA);
      void Promise.resolve()
        .then(() => limpiar())
        .then(() => {
          descartada.current = true;
        })
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
  }, [avisar, limpiar, ejecutar, navigate, pathname, search, hash]);

  const iniciarSesion = useCallback(
    ({ desde = null, registro = false } = {}) => {
      recordarVolverA(desde);
      return iniciar({ registro });
    },
    [iniciar],
  );

  const completarIngreso = useCallback(async () => {
    setPerfilDadoDeBaja(false);
    vencimientoAvisado.current = false;
    descartada.current = false;
    cambiarSesionHttp(claveSesionHttp, true);
    await ejecutar();
    return tomarVolverA();
  }, [claveSesionHttp, ejecutar]);

  const asociarPerfil = useCallback(
    async (rol, perfilId) => {
      await asociarEnElProveedor?.(rol, perfilId);
    },
    [asociarEnElProveedor],
  );

  const cerrarSesion = useCallback(async () => {
    recordarVolverA(null);
    const generacion = cambiarSesionHttp(claveSesionHttp, false);
    try {
      await cerrar();
      descartada.current = true;
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
  }, [avisar, claveSesionHttp, cerrar, ejecutar, navigate]);

  const invalidarPerfil = useCallback(async () => {
    setPerfilDadoDeBaja(true);
    await ejecutar();
  }, [ejecutar]);

  const valor = useMemo(
    () => ({
      usuario,
      sesionSimulada: simulada,
      ingresoSinConfigurar: sinConfigurar,
      estaAutenticado: Boolean(usuario),
      cargando: esperandoIdentidad || (verificandoCuenta && !usuario),
      errorDeCuenta,
      errorDeIngreso,
      CallbackComponent,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      invalidarPerfil,
      perfilDadoDeBaja,
      asociarPerfil,
      recargarCuenta: ejecutar,
      reintentarCuenta: reintentar,
    }),
    [
      usuario,
      simulada,
      sinConfigurar,
      verificandoCuenta,
      esperandoIdentidad,
      errorDeCuenta,
      errorDeIngreso,
      CallbackComponent,
      iniciarSesion,
      completarIngreso,
      cerrarSesion,
      invalidarPerfil,
      perfilDadoDeBaja,
      asociarPerfil,
      ejecutar,
      reintentar,
    ],
  );

  return <ContextoDeSesion.Provider value={valor}>{children}</ContextoDeSesion.Provider>;
}
