import { Link } from "react-router-dom";
import estilos from "./Boton.module.css";
import { clases } from "./clases.js";

export function EnlaceBoton({ variante = "secundario", className, ...resto }) {
  return (
    <Link className={clases(estilos.boton, estilos[variante], className)} {...resto} />
  );
}
