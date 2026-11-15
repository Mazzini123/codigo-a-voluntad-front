import { useLocation } from "react-router-dom";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { inicioPorRol, RUTA_INICIO } from "@/Presentation/Routes/rutas.js";

const MENSAJE_POR_DEFECTO = "Esta sección es para otro tipo de cuenta.";

export function SinPermisoPage({ children }) {
  const { usuario } = useAuth();
  const { state } = useLocation();
  return (
    <MensajeDePantalla
      titulo="No tenés permiso para ver esta página"
      tituloDePestana="Sin permiso"
      volverA={usuario ? inicioPorRol(usuario.rol) : RUTA_INICIO}
    >
      {children ?? state?.sinPermiso ?? MENSAJE_POR_DEFECTO}
    </MensajeDePantalla>
  );
}
