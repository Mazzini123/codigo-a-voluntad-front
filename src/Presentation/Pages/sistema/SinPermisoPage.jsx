import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import { inicioPorRol, RUTA_INICIO } from "@/Presentation/Routes/rutas.js";

export function SinPermisoPage({
  children = "Esta sección es para otro tipo de cuenta.",
}) {
  const { usuario } = useSesion();
  return (
    <MensajeDePantalla
      titulo="No tenés permiso para ver esta página"
      tituloDePestana="Sin permiso"
      volverA={usuario ? inicioPorRol(usuario.rol) : RUTA_INICIO}
    >
      {children}
    </MensajeDePantalla>
  );
}
