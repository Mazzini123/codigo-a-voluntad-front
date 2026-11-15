import { Link } from "react-router-dom";
import {
  RUTA_RESUMEN_COLECTIVO,
  rutaAdministrarProyecto,
  rutaPostulacionesRecibidas,
} from "@/Presentation/Routes/rutas.js";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./FranjaDeDueno.module.css";

export function FranjaDeDueno({ proyectoId }) {
  return (
    <div className={estilos.franja}>
      <p className={estilos.texto}>
        <Icono nombre="info" />
        Este proyecto es de tu colectivo
      </p>
      <Link to={RUTA_RESUMEN_COLECTIVO} className={estilos.enlace}>
        Ir al panel del colectivo
      </Link>
      {proyectoId && (
        <Link to={rutaAdministrarProyecto(proyectoId)} className={estilos.enlace}>
          Administrar proyecto
        </Link>
      )}
      {proyectoId && (
        <Link to={rutaPostulacionesRecibidas(proyectoId)} className={estilos.enlace}>
          Ver postulaciones
        </Link>
      )}
    </div>
  );
}
