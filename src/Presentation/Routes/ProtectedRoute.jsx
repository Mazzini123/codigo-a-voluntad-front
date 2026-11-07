import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth.js";
import { RUTA_BIENVENIDA } from "./rutas.js";
import estilos from "./ProtectedRoute.module.css";

export function ProtectedRoute({ roles, permitirSinPerfil = false }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <p role="status" className={estilos.verificando}>
        Verificando sesión…
      </p>
    );
  }
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location }} />;
  if (!usuario.rol) {
    return permitirSinPerfil ? <Outlet /> : <Navigate to={RUTA_BIENVENIDA} replace />;
  }
  if (roles && !roles.includes(usuario.rol))
    return <Navigate to="/sin-permiso" replace />;
  return <Outlet />;
}
