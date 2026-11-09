import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";

export function ErrorInesperadoPage() {
  return (
    <MensajeDePantalla titulo="Algo salió mal" tituloDePestana="Error inesperado">
      No pudimos mostrar esta pantalla. Volvé al inicio o recargá la página.
    </MensajeDePantalla>
  );
}
