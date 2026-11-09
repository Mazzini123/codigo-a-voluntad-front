import { MediosDeContactoPrivados } from "@/Presentation/Components/Formulario/MediosDeContactoPrivados.jsx";
import { useMediosDeColaboradora } from "@/Presentation/Hooks/colaboradora/useMediosDeColaboradora.js";

export function MediosPrivadosDeLaColaboradora({ colaboradoraId }) {
  const medios = useMediosDeColaboradora(colaboradoraId);
  return <MediosDeContactoPrivados medios={medios} />;
}
