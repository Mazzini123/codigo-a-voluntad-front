import { Link } from "react-router-dom";
import { ESTADO_REVISION } from "@/Application/Domain/Enums/ESTADO_REVISION.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { SelloDeEstado } from "@/Presentation/Components/App/ui/SelloDeEstado.jsx";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import {
  textoDeEstadoDeRevision,
  textoDeMotivo,
} from "@/Presentation/Formatos/revision.js";
import { rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "./FilaDeRevision.module.css";

const TONO_POR_ESTADO = Object.freeze({
  [ESTADO_REVISION.PENDIENTE]: "aviso",
  [ESTADO_REVISION.REVISADA]: "exito",
  [ESTADO_REVISION.DESCARTADA]: "neutro",
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
  const { proyecto } = revision;
  return (
    <li className={estilos.fila}>
      <div className={estilos.datos}>
        <SelloDeEstado tono={TONO_POR_ESTADO[revision.estado]}>
          {textoDeEstadoDeRevision(revision.estado)}
        </SelloDeEstado>
        <h2>
          <Link to={rutaProyecto(proyecto.id)}>{proyecto.titulo}</Link>
        </h2>
        {proyecto.colectivo?.nombre && (
          <p className={estilos.suave}>{proyecto.colectivo.nombre}</p>
        )}
        <p>{textoDeMotivo(revision.motivo)}</p>
        <p className={estilos.suave}>
          Pendiente desde el{" "}
          <time dateTime={revision.creadaEn}>{fechaLarga(revision.creadaEn)}</time>
        </p>
        {!pendiente && revision.resueltaEn && (
          <p className={estilos.suave}>
            Resuelta por {quienResolvio(revision, usuarioId)} el{" "}
            <time dateTime={revision.resueltaEn}>{fechaLarga(revision.resueltaEn)}</time>
          </p>
        )}
        {!pendiente && revision.nota && <p className={estilos.nota}>{revision.nota}</p>}
      </div>
      {pendiente && puedeResolver && (
        <div className={estilos.acciones}>
          <Boton
            disabled={deshabilitado}
            aria-label={`Marcar como revisada ${proyecto.titulo}`}
            onClick={() => alElegir(ESTADO_REVISION.REVISADA, revision)}
          >
            Marcar como revisada
          </Boton>
          <Boton
            disabled={deshabilitado}
            aria-label={`Descartar ${proyecto.titulo}`}
            onClick={() => alElegir(ESTADO_REVISION.DESCARTADA, revision)}
          >
            Descartar
          </Boton>
        </div>
      )}
    </li>
  );
}
