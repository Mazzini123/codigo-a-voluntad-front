import { MediosDeContactoPrivados } from "@/Presentation/Components/Formulario/MediosDeContactoPrivados.jsx";
import { useMediosDeColectivo } from "@/Presentation/Hooks/colectivo/useMediosDeColectivo.js";

export function MediosPrivadosDelColectivo({ colectivoId }) {
  const medios = useMediosDeColectivo(colectivoId);
  return <MediosDeContactoPrivados medios={medios} />;
}
