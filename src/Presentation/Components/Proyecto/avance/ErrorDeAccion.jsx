import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./ErrorDeAccion.module.css";

const MENSAJE_POR_DEFECTO = "No pudimos completar la acción. Probá de nuevo.";

export function ErrorDeAccion({ error }) {
  return (
    <p role="alert" className={estilos.error}>
      <Icono nombre="alerta" />
      {error.mensaje ?? MENSAJE_POR_DEFECTO}
    </p>
  );
}
