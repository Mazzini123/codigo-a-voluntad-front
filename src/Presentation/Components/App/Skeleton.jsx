import { useEffect, useState } from "react";
import { TextoOculto } from "./TextoOculto.jsx";
import estilos from "./Skeleton.module.css";

export function Skeleton({ etiqueta, demoraMs = 300, className, children }) {
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
    <div
      aria-busy="true"
      className={[estilos.contenedor, className].filter(Boolean).join(" ")}
    >
      <TextoOculto aria-live="polite">{anunciado ? etiqueta : ""}</TextoOculto>
      {visible && <div aria-hidden="true">{children}</div>}
    </div>
  );
}

export function BloqueSkeleton({ ancho = "100%", alto, forma = "linea" }) {
  return (
    <span
      className={`${estilos.bloque} ${estilos[forma]}`}
      style={{ inlineSize: ancho, blockSize: alto }}
    />
  );
}
