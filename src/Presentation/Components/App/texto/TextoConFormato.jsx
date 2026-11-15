import { useEffect, useState } from "react";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import estilos from "./TextoConFormato.module.css";

let markdownCargado = null;
let cargaEnCurso = null;

function cargarMarkdown() {
  cargaEnCurso ??= import("./MarkdownSeguro.jsx")
    .then((modulo) => {
      markdownCargado = modulo.default;
      return markdownCargado;
    })
    .catch(() => {
      cargaEnCurso = null;
      return null;
    });
  return cargaEnCurso;
}

export function TextoConFormato({ texto, nivel = 3, className }) {
  const [Markdown, setMarkdown] = useState(() => markdownCargado);
  const tieneTexto = Boolean(texto?.trim());

  useEffect(() => {
    if (Markdown || !tieneTexto) return undefined;
    let vigente = true;
    cargarMarkdown().then((cargado) => {
      if (vigente && cargado) setMarkdown(() => cargado);
    });
    return () => {
      vigente = false;
    };
  }, [Markdown, tieneTexto]);

  if (!tieneTexto) return null;
  return (
    <div className={clases(estilos.texto, className)}>
      {Markdown ? (
        <Markdown texto={texto} nivel={nivel} />
      ) : (
        <p className={estilos.provisorio}>{texto}</p>
      )}
    </div>
  );
}
