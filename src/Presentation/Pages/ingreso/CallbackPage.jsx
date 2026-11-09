import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ErrorDeVerificacionDeCuenta } from "@/Presentation/Components/App/sesion/ErrorDeVerificacionDeCuenta.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import { inicioPorRol, RUTA_LOGIN } from "@/Presentation/Routes/rutas.js";
import estilos from "./CallbackPage.module.css";

export function CallbackPage() {
  const { usuario, cargando, errorDeCuenta, completarIngreso, callbackExterno } =
    useSesion();
  const iniciado = useRef(false);
  const [resultado, setResultado] = useState({
    listo: false,
    volverA: null,
    fallo: false,
  });

  useEffect(() => {
    if (iniciado.current) return;
    if (callbackExterno && (!callbackExterno.listo || callbackExterno.fallo)) return;
    iniciado.current = true;
    completarIngreso(window.location.href)
      .then((volverA) => setResultado({ listo: true, volverA, fallo: false }))
      .catch(() => setResultado({ listo: false, volverA: null, fallo: true }));
  }, [completarIngreso, callbackExterno]);

  if (resultado.fallo || callbackExterno?.fallo) {
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
    return <Navigate to={resultado.volverA ?? inicioPorRol(usuario.rol)} replace />;
  }

  return (
    <div className={estilos.callback}>
      <TituloDePagina>Iniciando sesión</TituloDePagina>
      <p role="status" className={estilos.estado}>
        Iniciando sesión…
      </p>
    </div>
  );
}
