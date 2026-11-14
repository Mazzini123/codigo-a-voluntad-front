import { ColectivoForm } from "@/Presentation/Components/Colectivo/ColectivoForm.jsx";
import { AltaDePerfil } from "@/Presentation/Components/Formulario/AltaDePerfil.jsx";
import { esperandoIngreso } from "@/Application/Domain/Reglas/registro.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { RUTA_BIENVENIDA, RUTA_MIS_SOLICITUDES } from "@/Presentation/Routes/rutas.js";
import { useCrearColectivo } from "@/Presentation/Hooks/colectivo/useCrearColectivo.js";

export function AltaColectivoPage() {
  const alta = useCrearColectivo();
  const { usuario } = useAuth();
  const enEspera = esperandoIngreso(usuario);
  return (
    <AltaDePerfil
      alta={alta}
      tituloDePestana="Crear perfil del colectivo"
      titulo="Creá el perfil de tu colectivo"
      bajada="Con estos datos se presentan ante las colaboradoras. Después vas a poder publicar proyectos."
      volverA={enEspera ? RUTA_MIS_SOLICITUDES : RUTA_BIENVENIDA}
      textoVolver={enEspera ? "Volver a mis solicitudes" : "Elegir otro tipo de cuenta"}
    >
      <ColectivoForm
        esAlta
        textoEnviar="Crear perfil"
        textoEnviando="Creando…"
        enviando={alta.creando}
        errorEnvio={alta.error}
        alEnviar={alta.crear}
      />
    </AltaDePerfil>
  );
}
