import { Icono } from "../App/Icono.jsx";
import estilos from "./HabilidadList.module.css";

export function HabilidadList({ habilidades }) {
  return (
    <ul className={estilos.lista}>
      {habilidades.map((habilidad) => (
        <li className={estilos.tarjeta} key={habilidad.codigo}>
          <div className={estilos.texto}>
            <h3 className={estilos.titulo}>{habilidad.titulo}</h3>
            <p className={estilos.descripcion}>
              {habilidad.descripcion || "Sin descripción"}
            </p>
          </div>
          <Sello activa={habilidad.activo} />
        </li>
      ))}
    </ul>
  );
}

function Sello({ activa }) {
  return (
    <span className={`${estilos.sello} ${activa ? estilos.activa : estilos.inactiva}`}>
      <Icono nombre={activa ? "tilde" : "guion"} tamano={16} />
      {activa ? "Activa" : "Inactiva"}
    </span>
  );
}
