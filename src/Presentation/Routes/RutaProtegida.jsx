import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ErrorDeVerificacionDeCuenta } from "@/Presentation/Components/App/sesion/ErrorDeVerificacionDeCuenta.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_BIENVENIDA, RUTA_LOGIN, RUTA_SIN_PERMISO } from "./rutas.js";
import estilos from "./RutaProtegida.module.css";

export function RutaProtegida({ roles, permitirSinPerfil = false }) {
  const { usuario, cargando, errorDeCuenta } = useAuth();
  const location = useLocation();

  if (errorDeCuenta) return <ErrorDeVerificacionDeCuenta />;
  if (cargando) {
    return (
      <p role="status" className={estilos.verificando}>
        Verificando sesión…
      </p>
    );
  }
  if (!usuario) return <Navigate to={RUTA_LOGIN} replace state={{ desde: location }} />;
  if (!usuario.rol) {
    return permitirSinPerfil ? <Outlet /> : <Navigate to={RUTA_BIENVENIDA} replace />;
  }
  if (roles && !roles.includes(usuario.rol))
    return <Navigate to={RUTA_SIN_PERMISO} replace />;
  return <Outlet />;
}
