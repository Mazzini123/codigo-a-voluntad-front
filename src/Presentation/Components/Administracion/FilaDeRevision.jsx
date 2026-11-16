import { Link, useLocation } from "react-router-dom";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { SelloDeEstado } from "@/Presentation/Components/App/ui/SelloDeEstado.jsx";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import {
  esDePublicacion,
  textoDeEstadoDeRevision,
  textoDeMotivo,
} from "@/Presentation/Formatos/revision.js";
import { estadoParaVolver, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./FilaDeRevision.module.css";

const TONO_POR_ESTADO = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "aviso",
  [ESTADO_REVISION.REVISADA]: "exito",
  [ESTADO_REVISION.DESCARTADA]: "neutro",
});

const ACCIONES = Object.freeze({
  publicacion: Object.freeze({
    [ESTADO_REVISION.REVISADA]: {
      texto: "Aprobar",
      etiqueta: (titulo) => `Aprobar la publicación de ${titulo}`,
    },
    [ESTADO_REVISION.DESCARTADA]: {
      texto: "Pedir cambios",
      etiqueta: (titulo) => `Pedir cambios en la publicación de ${titulo}`,
    },
  }),
  seguimiento: Object.freeze({
    [ESTADO_REVISION.REVISADA]: {
      texto: "Marcar como revisada",
      etiqueta: (titulo) => `Marcar como revisada ${titulo}`,
    },
    [ESTADO_REVISION.DESCARTADA]: {
      texto: "Descartar",
      etiqueta: (titulo) => `Descartar ${titulo}`,
    },
  }),
});

function quienResolvio(revision, usuarioId) {
  return revision.resueltaPor && revision.resueltaPor === usuarioId
    ? "vos"
    : "otra persona de administración";
}

export function FilaDeRevision({
  revision,
  usuarioId,
  puedeResolver,
  deshabilitado,
  alElegir,
}) {
  const pendiente = revision.estado === ESTADO_REVISION.PENDIENTE;
  const publicacion = esDePublicacion(revision.motivo);
  const acciones = publicacion ? ACCIONES.publicacion : ACCIONES.seguimiento;
  const { proyecto } = revision;
  const volver = estadoParaVolver(useLocation(), "Volver a las revisiones");
  return (
    <li className={estilos.fila}>
      <div className={estilos.datos}>
        <SelloDeEstado tono={TONO_POR_ESTADO[revision.estado]}>
          {textoDeEstadoDeRevision(revision.estado, revision.motivo)}
        </SelloDeEstado>
        <h2>
          <Link to={rutaProyecto(proyecto.id)} state={volver}>
            {proyecto.titulo}
          </Link>
        </h2>
        {proyecto.colectivo?.nombre && (
          <p className={estilos.suave}>{proyecto.colectivo.nombre}</p>
        )}
        <p>{textoDeMotivo(revision.motivo)}</p>
        <p className={estilos.suave}>
          {publicacion ? "Pedida el " : "Pendiente desde el "}
          <time dateTime={revision.creadaEn}>{fechaLarga(revision.creadaEn)}</time>
        </p>
        {!pendiente && revision.resueltaEn && (
          <p className={estilos.suave}>
            Resuelta por {quienResolvio(revision, usuarioId)} el{" "}
            <time dateTime={revision.resueltaEn}>{fechaLarga(revision.resueltaEn)}</time>
          </p>
        )}
        {!pendiente && revision.nota && <p className={estilos.nota}>{revision.nota}</p>}
        {publicacion && pendiente && (
          <Link
            to={rutaProyecto(proyecto.id)}
            state={volver}
            className={estilos.enlace}
            aria-label={`Ver vista previa de ${proyecto.titulo}`}
          >
            Ver vista previa
          </Link>
        )}
      </div>
      {pendiente && puedeResolver && (
        <div className={estilos.acciones}>
          {[ESTADO_REVISION.REVISADA, ESTADO_REVISION.DESCARTADA].map((estado) => (
            <Boton
              key={estado}
              disabled={deshabilitado}
              aria-label={acciones[estado].etiqueta(proyecto.titulo)}
              onClick={() => alElegir(estado, revision)}
            >
              {acciones[estado].texto}
            </Boton>
          ))}
        </div>
      )}
    </li>
  );
}
