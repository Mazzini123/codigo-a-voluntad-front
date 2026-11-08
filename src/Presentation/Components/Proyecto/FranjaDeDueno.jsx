import { Link } from "react-router-dom";
import {
  RUTA_MIS_PROYECTOS,
  rutaAdministrarProyecto,
  rutaPostulacionesRecibidas,
} from "../../Routes/rutas.js";
import { Icono } from "../App/Icono.jsx";
import estilos from "./FranjaDeDueno.module.css";

export function FranjaDeDueno({ proyectoId }) {
  return (
    <div className={estilos.franja}>
      <p className={estilos.texto}>
        <Icono nombre="info" />
        Este proyecto es de tu colectivo
      </p>
      <Link to={RUTA_MIS_PROYECTOS} className={estilos.enlace}>
        Ver en Mis proyectos
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
