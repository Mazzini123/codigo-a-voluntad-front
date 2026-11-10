import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorDeVerificacionDeCuenta } from "@/Presentation/Components/App/sesion/ErrorDeVerificacionDeCuenta.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { inicioPorRol, RUTA_LOGIN, RUTA_NOMBRE } from "@/Presentation/Routes/rutas.js";
import estilos from "./CallbackPage.module.css";

export function CallbackPage() {
  const { usuario, cargando, errorDeCuenta, completarIngreso, CallbackComponent } =
    useAuth();
  const iniciado = useRef(false);
  const [proveedor, setProveedor] = useState("procesando");
  const [resultado, setResultado] = useState({
    listo: false,
    volverA: null,
    fallo: false,
  });
  const alCompletarElProveedor = useCallback(() => setProveedor("listo"), []);
  const alFallarElProveedor = useCallback(() => setProveedor("fallo"), []);

  useEffect(() => {
    if (proveedor !== "listo" || iniciado.current) return;
    iniciado.current = true;
    completarIngreso()
      .then((volverA) => setResultado({ listo: true, volverA, fallo: false }))
      .catch(() => setResultado({ listo: false, volverA: null, fallo: true }));
  }, [proveedor, completarIngreso]);

  if (resultado.fallo || proveedor === "fallo") {
    return (
      <div className={estilos.callback}>
        <TituloDePagina>No pudimos iniciar sesión</TituloDePagina>
        <EstadoDeError
          nivel={1}
          titulo="No pudimos iniciar sesión"
          error={{ mensaje: "El ingreso no se completó. Volvé a intentarlo." }}
        />
        <Link to={RUTA_LOGIN} className={estilos.volver}>
          Volver a ingresar
        </Link>
      </div>
    );
  }

  if (errorDeCuenta) return <ErrorDeVerificacionDeCuenta />;
  if (resultado.listo && !cargando && usuario) {
    const destino = resultado.volverA ?? inicioPorRol(usuario.rol);
    if (usuario.nombrePendiente) {
      return <Navigate to={RUTA_NOMBRE} replace state={{ volverA: destino }} />;
    }
    return <Navigate to={destino} replace />;
  }

  return (
    <div className={estilos.callback}>
      <TituloDePagina>Iniciando sesión</TituloDePagina>
      <p role="status" className={estilos.estado}>
        Iniciando sesión…
      </p>
      <CallbackComponent
        alCompletar={alCompletarElProveedor}
        alFallar={alFallarElProveedor}
      />
    </div>
  );
}
