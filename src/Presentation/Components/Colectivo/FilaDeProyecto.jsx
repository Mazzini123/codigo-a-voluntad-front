import { useRef } from "react";
import { Link } from "react-router-dom";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  estaPublicado,
  puedePedirPublicacion,
  rechazoDe,
} from "@/Application/Domain/Reglas/publicacion.js";
import {
  fechaLarga,
  textoPerfilesQueBuscan,
  textoPostulacionesPendientes,
} from "@/Presentation/Formatos/proyecto.js";
import {
  selloDelDueno,
  textoDeFechaSinPublicar,
  textoDeRechazo,
} from "@/Presentation/Formatos/publicacion.js";
import { rutaAdministrarProyecto, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import { PedirPublicacion } from "@/Presentation/Components/Proyecto/publicacion/PedirPublicacion.jsx";
import { bajaDe, estaDadoDeBaja } from "@/Application/Domain/Reglas/baja.js";
import { textoDeBajaDelProyecto } from "@/Presentation/Formatos/baja.js";
import estilos from "./FilaDeProyecto.module.css";
import { sinMarcas } from "@/Presentation/Formatos/markdown.js";

function fechaDeLaFila(proyecto) {
  const pedida = textoDeFechaSinPublicar(proyecto);
  if (pedida) return pedida;
  const fecha = proyecto.fechaFinalizacion ?? proyecto.fechaCreacion;
  if (!fecha) return null;
  const texto = proyecto.fechaFinalizacion
    ? "Finalizado el "
    : estaPublicado(proyecto)
      ? "Publicado el "
      : "Creado el ";
  return { texto, fecha };
}

function FechaDelProyecto({ proyecto }) {
  const datos = fechaDeLaFila(proyecto);
  if (!datos) return null;
  return (
    <span>
      {datos.texto}
      <time dateTime={datos.fecha}>{fechaLarga(datos.fecha)}</time>
    </span>
  );
}

export function FilaDeProyecto({ proyecto, abiertos, pendientes, nivel = 3, alCambiar }) {
  const Titulo = `h${nivel}`;
  const sello = selloDelDueno(proyecto);
  const rechazo = rechazoDe(proyecto);
  const dadoDeBaja = estaDadoDeBaja(proyecto);
  const idTitulo = `proyecto-${proyecto.id}`;
  const refTitulo = useRef(null);
  const muestraPerfiles =
    abiertos !== null && proyecto.estado === PROYECTO_ESTADO.ABIERTO;
  return (
    <article className={estilos.fila} aria-labelledby={idTitulo}>
      <div>
        <Titulo id={idTitulo}>
          <Link ref={refTitulo} to={rutaProyecto(proyecto.id)}>
            {proyecto.titulo}
          </Link>
        </Titulo>
        {proyecto.descripcion && (
          <p className={estilos.descripcion}>{sinMarcas(proyecto.descripcion)}</p>
        )}
        <div className={estilos.datos}>
          {sello && <SelloDeBusqueda estado={sello} />}
          {muestraPerfiles && <span>{textoPerfilesQueBuscan(abiertos)}</span>}
          {pendientes > 0 && <span>{textoPostulacionesPendientes(pendientes)}</span>}
          <FechaDelProyecto proyecto={proyecto} />
        </div>
        {rechazo && <p className={estilos.rechazo}>{textoDeRechazo(rechazo)}</p>}
        {dadoDeBaja && (
          <p className={estilos.rechazo}>{textoDeBajaDelProyecto(bajaDe(proyecto))}</p>
        )}
      </div>
      <div className={estilos.acciones}>
        {alCambiar && puedePedirPublicacion(proyecto) && (
          <PedirPublicacion
            proyecto={proyecto}
            alCambiar={alCambiar}
            destinoDeFoco={() => refTitulo.current}
          />
        )}
        {!dadoDeBaja && (
          <EnlaceBoton to={rutaAdministrarProyecto(proyecto.id)}>Administrar</EnlaceBoton>
        )}
      </div>
    </article>
  );
}
