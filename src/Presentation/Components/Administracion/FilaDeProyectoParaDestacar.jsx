import { useId } from "react";
import { Link } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { SelloDeDestacado } from "@/Presentation/Components/Proyecto/listado/SelloDeDestacado.jsx";
import { rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./FilaDeProyectoParaDestacar.module.css";

export function FilaDeProyectoParaDestacar({
  proyecto,
  acciones,
  destacado = false,
  vigencia = null,
  motivoDeshabilitado = null,
}) {
  const idMotivo = useId();
  return (
    <li className={estilos.fila}>
      <div className={estilos.datos}>
        {destacado && <SelloDeDestacado />}
        <h3>
          <Link to={rutaProyecto(proyecto.id)}>{proyecto.titulo}</Link>
        </h3>
        {proyecto.colectivo?.nombre && (
          <p className={estilos.colectivo}>{proyecto.colectivo.nombre}</p>
        )}
        {vigencia && <p className={estilos.vigencia}>{vigencia}</p>}
      </div>
      <div className={estilos.acciones}>
        {acciones.map(
          ({ texto, accion, variante, deshabilitado, descripcion, nombreAccesible }) => (
            <Boton
              key={texto}
              variante={variante}
              disabled={deshabilitado || Boolean(motivoDeshabilitado)}
              aria-label={nombreAccesible}
              aria-describedby={motivoDeshabilitado ? idMotivo : descripcion}
              onClick={accion}
            >
              {texto}
            </Boton>
          ),
        )}
        {motivoDeshabilitado && acciones.length > 0 && (
          <p id={idMotivo} className={estilos.motivo}>
            {motivoDeshabilitado}
          </p>
        )}
      </div>
    </li>
  );
}
