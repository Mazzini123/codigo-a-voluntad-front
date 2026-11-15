import { useId } from "react";
import { textoDePorcentaje } from "@/Presentation/Formatos/avance.js";
import estilos from "./BarraDeAvance.module.css";

export function BarraDeAvance({ porcentaje }) {
  const id = useId();
  return (
    <div className={estilos.avance}>
      <label htmlFor={id}>Avance: {textoDePorcentaje(porcentaje)}</label>
      <progress id={id} value={porcentaje} max={100} />
    </div>
  );
}
