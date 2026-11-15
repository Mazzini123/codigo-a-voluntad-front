import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./SelloDeDestacado.module.css";

export function SelloDeDestacado() {
  return (
    <span className={estilos.sello}>
      <Icono nombre="estrella" tamano={16} />
      Destacado
    </span>
  );
}
