import { Link } from "react-router-dom";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  fechaLarga,
  selloDeProyecto,
  textoPerfilesQueBuscan,
  textoPostulacionesPendientes,
} from "@/Presentation/Formatos/proyecto.js";
import { rutaAdministrarProyecto, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import estilos from "./FilaDeProyecto.module.css";
import { sinMarcas } from "@/Presentation/Formatos/markdown.js";

export function FilaDeProyecto({ proyecto, abiertos, pendientes, nivel = 3 }) {
  const Titulo = `h${nivel}`;
  const sello = selloDeProyecto(proyecto.estado);
  const fecha = proyecto.fechaFinalizacion ?? proyecto.fechaCreacion;
  const idTitulo = `proyecto-${proyecto.id}`;
  return (
    <article className={estilos.fila} aria-labelledby={idTitulo}>
      <div>
        <Titulo id={idTitulo}>
          <Link to={rutaProyecto(proyecto.id)}>{proyecto.titulo}</Link>
        </Titulo>
        {proyecto.descripcion && (
          <p className={estilos.descripcion}>{sinMarcas(proyecto.descripcion)}</p>
        )}
        <div className={estilos.datos}>
          {sello && <SelloDeBusqueda estado={sello} />}
          {abiertos !== null && proyecto.estado !== PROYECTO_ESTADO.FINALIZADO && (
            <span>{textoPerfilesQueBuscan(abiertos)}</span>
          )}
          {pendientes > 0 && <span>{textoPostulacionesPendientes(pendientes)}</span>}
          {fecha && (
            <span>
              {proyecto.fechaFinalizacion ? "Finalizado el " : "Publicado el "}
              <time dateTime={fecha}>{fechaLarga(fecha)}</time>
            </span>
          )}
        </div>
      </div>
      <EnlaceBoton to={rutaAdministrarProyecto(proyecto.id)}>Administrar</EnlaceBoton>
    </article>
  );
}
