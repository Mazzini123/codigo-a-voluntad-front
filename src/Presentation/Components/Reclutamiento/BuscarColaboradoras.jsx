import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { motivoNoPostulable } from "@/Presentation/Formatos/proyecto.js";
import { rutaColaboradorasPotenciales } from "@/Presentation/Routes/rutas.js";

export function BuscarColaboradoras({
  perfil,
  proyecto,
  hoy = new Date(),
  disabled = false,
}) {
  const motivo = motivoNoPostulable(perfil, proyecto, hoy);
  if (motivo || disabled) {
    return (
      <Boton disabled motivoDeshabilitado={motivo ?? undefined}>
        Buscar colaboradoras
      </Boton>
    );
  }
  return (
    <EnlaceBoton to={rutaColaboradorasPotenciales(proyecto.id, perfil.id)}>
      Buscar colaboradoras
    </EnlaceBoton>
  );
}
