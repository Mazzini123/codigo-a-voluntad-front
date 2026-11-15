import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { rutaPendienteDelRegistro } from "./rutas.js";

export function GuardaDeRegistro() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const pendiente = rutaPendienteDelRegistro(usuario, pathname);
  return pendiente ? <Navigate to={pendiente} replace /> : <Outlet />;
}
