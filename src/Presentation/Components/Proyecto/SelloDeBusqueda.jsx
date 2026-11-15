import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { ESTADO_BUSQUEDA } from "@/Presentation/Formatos/proyecto.js";
import estilos from "./SelloDeBusqueda.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

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
    <span className={clases(estilos.sello, estilos[estado.tipo])}>
      <Icono nombre={ICONOS[estado.tipo]} tamano={16} />
      {estado.texto}
    </span>
  );
}
