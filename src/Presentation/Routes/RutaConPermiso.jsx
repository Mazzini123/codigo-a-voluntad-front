import { Outlet } from "react-router-dom";
import { tienePermiso } from "@/Application/Domain/Reglas/permisos.js";
import { SinPermisoPage } from "@/Presentation/Pages/sistema/SinPermisoPage.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";

export function RutaConPermiso({ permiso, sinPermiso }) {
  const { usuario } = useAuth();
  if (!tienePermiso(usuario, permiso)) {
    return <SinPermisoPage>{sinPermiso}</SinPermisoPage>;
  }
  return <Outlet />;
}
