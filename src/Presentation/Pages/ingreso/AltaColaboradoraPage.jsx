import { ReactivarColaboradora } from "@/Presentation/Components/Colaboradora/ReactivarColaboradora.jsx";
import { perfilDadoDeBajaDe } from "@/Presentation/Formatos/bajaDeColaboradora.js";
import { ColaboradoraForm } from "@/Presentation/Components/Colaboradora/ColaboradoraForm.jsx";
import { AltaDePerfil } from "@/Presentation/Components/Formulario/AltaDePerfil.jsx";
import { useCatalogoDeHabilidades } from "@/Presentation/Hooks/habilidad/useCatalogoDeHabilidades.js";
import { useCrearColaboradora } from "@/Presentation/Hooks/colaboradora/useCrearColaboradora.js";

export function AltaColaboradoraPage() {
  const catalogo = useCatalogoDeHabilidades();
  const alta = useCrearColaboradora();
  const perfilAnterior = perfilDadoDeBajaDe(alta.error);
  return (
    <AltaDePerfil
      alta={alta}
      tituloDePestana="Crear perfil de colaboradora"
      titulo="Creá tu perfil de colaboradora"
      bajada="Contá qué sabés hacer para encontrar proyectos que encajen con vos."
    >
      {perfilAnterior && <ReactivarColaboradora colaboradorId={perfilAnterior} />}
      <ColaboradoraForm
        esAlta
        catalogo={catalogo}
        textoEnviar="Crear perfil"
        textoEnviando="Creando…"
        enviando={alta.creando}
        errorEnvio={perfilAnterior ? null : alta.error}
        alEnviar={alta.crear}
      />
    </AltaDePerfil>
  );
}
