import { Link } from "react-router-dom";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./EnlaceVolver.module.css";

export function EnlaceVolver({ children, ...resto }) {
  return (
    <Link className={estilos.volver} {...resto}>
      <Icono nombre="flechaIzquierda" />
      {children}
    </Link>
  );
}
