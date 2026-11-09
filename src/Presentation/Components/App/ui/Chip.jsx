import { Icono } from "./Icono.jsx";
import { TextoOculto } from "./TextoOculto.jsx";
import estilos from "./Chip.module.css";
import { clases } from "./clases.js";

export function Chip({
  tipo = "requerida",
  mostrarTipo = false,
  laTenes = false,
  children,
}) {
  return (
    <span className={clases(estilos.chip, estilos[tipo])}>
      {laTenes && <Icono nombre="tilde" tamano={16} />}
      {children}
      {mostrarTipo && tipo === "opcional" && " · opcional"}
      {laTenes && <TextoOculto>. La tenés</TextoOculto>}
    </span>
  );
}
