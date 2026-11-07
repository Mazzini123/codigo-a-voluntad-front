import estilos from "./FranjaDeEncaje.module.css";

export function FranjaDeEncaje({ className, children }) {
  return (
    <p className={[estilos.franja, className].filter(Boolean).join(" ")}>{children}</p>
  );
}
