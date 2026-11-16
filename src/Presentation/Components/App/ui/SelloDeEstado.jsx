import { clases } from "./clases.js";
import estilos from "./SelloDeEstado.module.css";

export function SelloDeEstado({ tono = "neutro", children }) {
  return <span className={clases(estilos.sello, estilos[tono])}>{children}</span>;
}
