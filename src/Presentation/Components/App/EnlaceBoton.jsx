import { Link } from "react-router-dom";
import estilos from "./Boton.module.css";

export function EnlaceBoton({ variante = "secundario", className, ...resto }) {
  const clases = [estilos.boton, estilos[variante], className].filter(Boolean).join(" ");
  return <Link className={clases} {...resto} />;
}
