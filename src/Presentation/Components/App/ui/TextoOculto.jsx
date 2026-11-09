import estilos from "./TextoOculto.module.css";

export function TextoOculto({ children, ...resto }) {
  return (
    <span className={estilos.oculto} {...resto}>
      {children}
    </span>
  );
}
