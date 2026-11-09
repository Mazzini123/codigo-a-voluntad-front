import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";

export function NoEncontradaPage() {
  return (
    <MensajeDePantalla
      titulo="No encontramos esta página"
      tituloDePestana="Página no encontrada"
    >
      Puede que el enlace esté mal escrito o que la página ya no exista.
    </MensajeDePantalla>
  );
}
