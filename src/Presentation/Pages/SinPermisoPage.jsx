import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { inicioPorRol } from "../Routes/rutas.js";

export function SinPermisoPage() {
  const { usuario } = useAuth();
  return (
    <MensajeDePantalla
      titulo="No tenés permiso para ver esta página"
      tituloDePestana="Sin permiso"
      volverA={usuario ? inicioPorRol(usuario.rol) : "/"}
    >
      Esta sección es para otro tipo de cuenta.
    </MensajeDePantalla>
  );
}
