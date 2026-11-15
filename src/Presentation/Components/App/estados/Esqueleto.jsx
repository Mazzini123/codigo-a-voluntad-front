import { useEffect, useState } from "react";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import estilos from "./Esqueleto.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

export function Esqueleto({ etiqueta, demoraMs = 300, className, children }) {
  const [visible, setVisible] = useState(demoraMs <= 0);
  const [anunciado, setAnunciado] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(
      () => {
        setVisible(true);
        setAnunciado(true);
      },
      Math.max(demoraMs, 0),
    );
    return () => clearTimeout(temporizador);
  }, [demoraMs]);

  return (
    <div aria-busy="true" className={clases(estilos.contenedor, className)}>
      <TextoOculto aria-live="polite">{anunciado ? etiqueta : ""}</TextoOculto>
      {visible && <div aria-hidden="true">{children}</div>}
    </div>
  );
}

export function BloqueEsqueleto({ ancho = "100%", alto, forma = "linea" }) {
  return (
    <span
      className={clases(estilos.bloque, estilos[forma])}
      style={{ inlineSize: ancho, blockSize: alto }}
    />
  );
}
