import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { useCallback, useRef, useState } from "react";
import { AccionesDeColaboracion } from "@/Presentation/Components/Valoracion/AccionesDeColaboracion.jsx";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { CODIGO_ERROR } from "@/Application/Domain/Enums/CODIGO_ERROR.js";
import {
  esColaboracionPropia,
  postulanteVisible,
} from "@/Application/Domain/Reglas/postulacion.js";
import { COLABORACION_ESTADO as ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import {
  confirmacionDeAceptar,
  ESTADOS,
  fechaValida,
  MENSAJE_COLABORACION_PROPIA,
  nombreDelPostulante,
  selloDePostulacion,
  tituloDelGrupo,
} from "@/Presentation/Formatos/colaboracion.js";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import { HabilidadesDelPostulante } from "@/Presentation/Components/Postulacion/HabilidadesDelPostulante.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  esContribucionAnonimaAceptada,
  MENSAJE_CONTRIBUCION_ANONIMA,
  puedeVerContacto,
} from "@/Presentation/Formatos/contacto.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { usePostulacionesRecibidas } from "@/Presentation/Hooks/postulacion/usePostulacionesRecibidas.js";
import {
  estadoParaVolver,
  rutaColaboradora,
  rutaContactoDeColaboradora,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./PostulacionesRecibidasPage.module.css";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

const ACCIONES = {
  aceptar: {
    texto: "Aceptar",
    resultado: "Se aceptó la postulación.",
  },
  rechazar: {
    texto: "Rechazar",
    titulo: "¿Rechazar la postulación?",
    descripcion: "La persona dejará de estar pendiente de revisión.",
    resultado: "Se rechazó la postulación.",
    permanente: true,
  },
  desvincular: {
    texto: "Desvincular",
    titulo: "¿Desvincular la colaboración?",
    descripcion: "La persona deja de participar y la colaboración queda en el historial.",
    resultado: "Se desvinculó la colaboración.",
    permanente: true,
  },
};

function agrupar(perfiles, filas, filtro) {
  const grupos = new Map(
    perfiles.map((perfil, indice) => [
      perfil.id,
      {
        titulo: tituloDelGrupo(perfil, indice),
        perfil,
        filas: [],
        aceptadas: 0,
      },
    ]),
  );
  const eliminados = { titulo: "Perfil eliminado", filas: [] };
  for (const fila of filas) {
    const grupo = grupos.get(fila.perfil);
    if (grupo && fila.estado === ESTADO.ACEPTADA) grupo.aceptadas += 1;
    if (!filtro || fila.estado === filtro) (grupo ?? eliminados).filas.push(fila);
  }
  return [...grupos.values(), eliminados].filter((grupo) => grupo.filas.length > 0);
}

export default function PostulacionesRecibidasPage() {
  const { id } = useParams();
  return <Postulaciones key={id} id={id} />;
}

function Cargando({ etiqueta }) {
  return (
    <Esqueleto etiqueta={etiqueta}>
      <BloqueEsqueleto alto="2rem" />
      <BloqueEsqueleto />
    </Esqueleto>
  );
}

function Postulaciones({ id }) {
  const [parametros, setParametros] = useSearchParams();
  const [confirmacion, setConfirmacion] = useState(null);
  const avisar = useAvisos();
  const refTitulo = useRef(null);
  const enfocarTitulo = useCallback(() => refTitulo.current, []);
  const solicitado = parametros.get("estado");
  const filtro = ESTADOS.some(({ valor }) => valor === solicitado) ? solicitado : "";
  const {
    datos,
    error,
    cargando,
    reintentar,
    resolver,
    procesando,
    meta,
    pagina,
    cambiarPagina,
  } = usePostulacionesRecibidas(id, filtro);
  const [proyecto, filas] = datos ?? [null, []];
  const accion = confirmacion && {
    ...ACCIONES[confirmacion.tipo],
    ...(confirmacion.tipo === "aceptar" && confirmacionDeAceptar(confirmacion.fila)),
  };
  const grupos = agrupar(proyecto?.perfiles ?? [], filas, filtro);

  function cambiarFiltro(evento) {
    const siguientes = new URLSearchParams(parametros);
    if (evento.target.value) siguientes.set("estado", evento.target.value);
    else siguientes.delete("estado");
    setParametros(siguientes);
  }

  async function confirmar() {
    const resultado = await resolver(confirmacion.tipo, confirmacion.fila.id);
    if (!resultado) return;
    setConfirmacion(null);
    if (resultado.fallo) {
      avisar.error(
        resultado.fallo.codigo === CODIGO_ERROR.COLABORACION_PROPIA
          ? MENSAJE_COLABORACION_PROPIA
          : resultado.fallo.status === 409
            ? "La postulación cambió o ya no se puede realizar esa acción."
            : "No pudimos confirmar el resultado de la acción. Revisá el estado de la postulación.",
      );
    } else {
      avisar.exito(accion.resultado);
    }
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-postulaciones-recibidas">
      <TituloDePagina>Postulaciones recibidas</TituloDePagina>
      <Link className={estilos.enlace} to={rutaProyecto(id)}>
        Volver al proyecto
      </Link>
      <div>
        <h1 id="titulo-postulaciones-recibidas" ref={refTitulo} tabIndex={-1}>
          Postulaciones recibidas
        </h1>
        {proyecto && <p>{proyecto.titulo}</p>}
      </div>
      {error ? (
        <EstadoDeError
          titulo="No pudimos actualizar las postulaciones"
          error={error}
          alReintentar={reintentar}
        />
      ) : !proyecto ? (
        <Cargando etiqueta="Cargando postulaciones…" />
      ) : (
        <>
          <div className={estilos.filtro}>
            <Selector
              etiqueta="Estado de la postulación"
              opciones={ESTADOS}
              value={filtro}
              onChange={cambiarFiltro}
              disabled={procesando}
            />
          </div>
          {!filas.length && <p>Todavía no recibiste postulaciones.</p>}
          {filas.length > 0 && !grupos.length && (
            <p>No hay postulaciones con este estado.</p>
          )}
          {grupos.map((grupo) => (
            <Grupo
              key={grupo.perfil?.id ?? "eliminados"}
              proyectoId={id}
              grupo={grupo}
              editable={proyecto.estado === PROYECTO_ESTADO.ABIERTO}
              ocupado={procesando || cargando}
              alActualizar={reintentar}
              alElegir={(tipo, fila) => setConfirmacion({ tipo, fila })}
            />
          ))}
        </>
      )}
      <Paginacion
        pagina={pagina}
        totalPaginas={meta?.total_pages ?? 0}
        etiqueta="Páginas de postulaciones recibidas"
        alCambiar={cambiarPagina}
      />
      <DialogoDeConfirmacion
        abierto={Boolean(accion)}
        titulo={accion?.titulo}
        descripcion={accion?.descripcion}
        textoConfirmar={accion?.texto}
        permanente={Boolean(accion?.permanente)}
        enviando={procesando}
        textoEnviando="Procesando…"
        destinoDeFoco={enfocarTitulo}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function Grupo({ proyectoId, grupo, editable, ocupado, alElegir, alActualizar }) {
  const { perfil, aceptadas } = grupo;
  const sinCupo =
    perfil?.limiteColaboraciones != null &&
    (perfil.cantidadAceptadas ?? aceptadas) >= perfil.limiteColaboraciones;
  const motivo = !perfil
    ? "El perfil ya no existe."
    : sinCupo
      ? "Límite alcanzado."
      : undefined;
  return (
    <section className={estilos.grupo}>
      <h2>{grupo.titulo}</h2>
      {perfil?.titulo && perfil.descripcion && <p>{perfil.descripcion}</p>}
      <ul className={estilos.lista}>
        {grupo.filas.map((fila) => (
          <Fila
            key={fila.id}
            proyectoId={proyectoId}
            fila={fila}
            perfil={perfil}
            motivo={motivo}
            editable={editable}
            ocupado={ocupado}
            alElegir={alElegir}
            alActualizar={alActualizar}
          />
        ))}
      </ul>
    </section>
  );
}

function Fila({
  proyectoId,
  fila,
  perfil,
  motivo,
  editable,
  ocupado,
  alElegir,
  alActualizar,
}) {
  const location = useLocation();
  const { usuario } = useAuth();
  const propia = esColaboracionPropia(usuario, fila);
  const persona = postulanteVisible(fila);
  const nombre = nombreDelPostulante(fila);
  const volver = estadoParaVolver(location, "Volver a las postulaciones");
  return (
    <li className={estilos.fila}>
      <div className={estilos.cabecera}>
        <h3>
          {persona?.id ? (
            <Link
              className={estilos.enlace}
              to={rutaColaboradora(persona.id)}
              state={volver}
            >
              {nombre}
            </Link>
          ) : (
            nombre
          )}
        </h3>
        <p className={estilos.estado}>
          <SelloDeBusqueda estado={selloDePostulacion(fila.estado)} />
          {fechaValida(fila.fecha) && (
            <time dateTime={fila.fecha}>{fechaLarga(fila.fecha)}</time>
          )}
        </p>
      </div>
      {persona?.id && (
        <HabilidadesDelPostulante colaboradoraId={persona.id} perfil={perfil} />
      )}
      {esContribucionAnonimaAceptada(fila) && <p>{MENSAJE_CONTRIBUCION_ANONIMA}</p>}
      <AccionesDeColaboracion
        proyectoId={proyectoId}
        colaboracion={fila}
        ocupado={ocupado}
        alActualizar={alActualizar}
        antes={
          puedeVerContacto(fila) && (
            <EnlaceBoton
              to={rutaContactoDeColaboradora(proyectoId, persona.id)}
              state={volver}
            >
              Ver datos de contacto
            </EnlaceBoton>
          )
        }
      >
        {editable && fila.estado === ESTADO.PENDIENTE && (
          <>
            <Boton
              variante="primario"
              disabled={ocupado || Boolean(motivo) || propia}
              motivoDeshabilitado={propia ? MENSAJE_COLABORACION_PROPIA : motivo}
              onClick={() => alElegir("aceptar", fila)}
            >
              Aceptar
            </Boton>
            <Boton
              disabled={ocupado || propia}
              motivoDeshabilitado={propia ? MENSAJE_COLABORACION_PROPIA : undefined}
              onClick={() => alElegir("rechazar", fila)}
            >
              Rechazar
            </Boton>
          </>
        )}
        {editable && fila.estado === ESTADO.ACEPTADA && (
          <Boton
            variante="peligroso"
            disabled={ocupado || propia}
            motivoDeshabilitado={propia ? MENSAJE_COLABORACION_PROPIA : undefined}
            onClick={() => alElegir("desvincular", fila)}
          >
            Desvincular
          </Boton>
        )}
      </AccionesDeColaboracion>
    </li>
  );
}
