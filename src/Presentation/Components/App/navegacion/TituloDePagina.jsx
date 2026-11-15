import { useEffect } from "react";

const SITIO = "Código a Voluntad";

export function TituloDePagina({ children }) {
  useEffect(() => {
    document.title = children ? `${children} · ${SITIO}` : SITIO;
  }, [children]);
  return null;
}
