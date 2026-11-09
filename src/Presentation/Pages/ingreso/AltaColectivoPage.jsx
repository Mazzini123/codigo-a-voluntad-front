import { ColectivoForm } from "@/Presentation/Components/Colectivo/ColectivoForm.jsx";
import { AltaDePerfil } from "@/Presentation/Components/Formulario/AltaDePerfil.jsx";
import { useCrearColectivo } from "@/Presentation/Hooks/colectivo/useCrearColectivo.js";

export function AltaColectivoPage() {
  const alta = useCrearColectivo();
  return (
    <AltaDePerfil
      alta={alta}
      tituloDePestana="Crear perfil del colectivo"
      titulo="Creá el perfil de tu colectivo"
      bajada="Con estos datos se presentan ante las colaboradoras. Después vas a poder publicar proyectos."
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
