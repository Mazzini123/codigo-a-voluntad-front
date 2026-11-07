import { Icono } from "../App/Icono.jsx";
import { ESTADO_BUSQUEDA } from "../../Formatos/proyecto.js";
import estilos from "./SelloDeBusqueda.module.css";

const ICONOS = {
  pendiente: "aviso",
  aceptada: "tilde",
  mixta: "info",
  [ESTADO_BUSQUEDA.ABIERTA]: "tilde",
  [ESTADO_BUSQUEDA.LIMITE]: "aviso",
  [ESTADO_BUSQUEDA.CERRADA]: "guion",
  [ESTADO_BUSQUEDA.FINALIZADO]: "guion",
  [ESTADO_BUSQUEDA.RECHAZADA]: "cruz",
};

export function SelloDeBusqueda({ estado }) {
  return (
    <span className={`${estilos.sello} ${estilos[estado.tipo]}`}>
      <Icono nombre={ICONOS[estado.tipo]} tamano={16} />
      {estado.texto}
    </span>
  );
}
