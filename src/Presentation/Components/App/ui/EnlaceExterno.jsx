import { TextoOculto } from "./TextoOculto.jsx";
import { leerUrlExterna } from "./urlExterna.js";

export function EnlaceExterno({ url, className, children }) {
  if (!leerUrlExterna(url)) return <span className={className}>{children}</span>;
  return (
    <a className={className} href={url.trim()} target="_blank" rel="noopener noreferrer">
      {children}
      <TextoOculto> (se abre en otra pestaña)</TextoOculto>
    </a>
  );
}
