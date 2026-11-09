import estilos from "./FranjaDeEncaje.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

export function FranjaDeEncaje({ className, children }) {
  return <p className={clases(estilos.franja, className)}>{children}</p>;
}
