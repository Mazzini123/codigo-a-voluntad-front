import { useCallback, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { COLABORACION_ESTADO as ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { usePostulacionesRecibidas } from "@/Presentation/Hooks/postulacion/usePostulacionesRecibidas.js";
import {
  estadoParaVolver,
  rutaColaboradora,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./PostulacionesRecibidasPage.module.css";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";

const ESTADOS = [
  { valor: "", texto: "Todas" },
  { valor: ESTADO.PENDIENTE, texto: "Pendientes", singular: "Pendiente" },
  { valor: ESTADO.ACEPTADA, texto: "Aceptadas", singular: "Aceptada" },
  { valor: ESTADO.RECHAZADA, texto: "Rechazadas", singular: "Rechazada" },
  { valor: ESTADO.FINALIZADA, texto: "Finalizadas", singular: "Finalizada" },
  { valor: ESTADO.DESVINCULADA, texto: "Desvinculadas", singular: "Desvinculada" },
];

const ACCIONES = {
  aceptar: {
    texto: "Aceptar",
    titulo: "¿Aceptar la postulación?",
    descripcion: "La persona pasa a colaborar en este perfil y ocupa un lugar.",
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
      { titulo: `Perfil ${indice + 1}`, perfil, filas: [], aceptadas: 0 },
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
  const { datos, error, cargando, reintentar, resolver, procesando } =
    usePostulacionesRecibidas(id);
  const solicitado = parametros.get("estado");
  const filtro = ESTADOS.some(({ valor }) => valor === solicitado) ? solicitado : "";
  const [proyecto, filas] = datos ?? [null, []];
  const accion = confirmacion && ACCIONES[confirmacion.tipo];
  const grupos = agrupar(proyecto?.perfiles ?? [], filas, filtro);

  function cambiarFiltro(evento) {
    const siguientes = new URLSearchParams(parametros);
    if (evento.target.value) siguientes.set("estado", evento.target.value);
    else siguientes.delete("estado");
    setParametros(siguientes);
  }

  async function confirmar() {
    const resultado = await resolver(confirmacion.tipo, confirmacion.id);
    if (!resultado) return;
    setConfirmacion(null);
    if (resultado.fallo) {
      avisar.error(
        resultado.fallo.status === 409
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
              grupo={grupo}
              editable={proyecto.estado === PROYECTO_ESTADO.ABIERTO}
              ocupado={procesando || cargando}
              alElegir={(tipo, id) => setConfirmacion({ tipo, id })}
            />
          ))}
        </>
      )}
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

function Grupo({ grupo, editable, ocupado, alElegir }) {
  const { perfil, aceptadas } = grupo;
  const sinCupo =
    perfil?.limiteColaboraciones != null && aceptadas >= perfil.limiteColaboraciones;
  const motivo = !perfil
    ? "El perfil ya no existe."
    : sinCupo
      ? "Límite alcanzado."
      : undefined;
  return (
    <section className={estilos.grupo}>
      <h2>{grupo.titulo}</h2>
      {perfil && <p>{perfil.descripcion}</p>}
      <ul className={estilos.lista}>
        {grupo.filas.map((fila) => (
          <Fila
            key={fila.id}
            fila={fila}
            motivo={motivo}
            editable={editable}
            ocupado={ocupado}
            alElegir={alElegir}
          />
        ))}
      </ul>
    </section>
  );
}

function Fila({ fila, motivo, editable, ocupado, alElegir }) {
  const location = useLocation();
  const persona = fila.esPublica === false ? null : fila.colaborador;
  const nombre =
    fila.esPublica === false
      ? "Postulación anónima"
      : nombreVisible(persona) || "Identidad no disponible";
  const habilidades = persona?.habilidades?.map(({ titulo }) => titulo).filter(Boolean);
  const estado =
    ESTADOS.find(({ valor }) => valor === fila.estado)?.singular ??
    "Estado no disponible";
  const fecha = fila.fecha && Number.isFinite(Date.parse(fila.fecha));
  return (
    <li className={estilos.fila}>
      <h3>
        {persona?.id ? (
          <Link
            className={estilos.enlace}
            to={rutaColaboradora(persona.id)}
            state={estadoParaVolver(location, "Volver a las postulaciones")}
          >
            {nombre}
          </Link>
        ) : (
          nombre
        )}
      </h3>
      <p>
        <strong>{estado}</strong>
        {fecha && (
          <>
            {" "}
            · <time dateTime={fila.fecha}>{fechaLarga(fila.fecha)}</time>
          </>
        )}
      </p>
      {habilidades?.length > 0 && <p>Habilidades: {habilidades.join(", ")}</p>}
      {editable && fila.estado === ESTADO.PENDIENTE && (
        <div className={estilos.acciones}>
          <Boton
            disabled={ocupado || Boolean(motivo)}
            motivoDeshabilitado={motivo}
            onClick={() => alElegir("aceptar", fila.id)}
          >
            Aceptar
          </Boton>
          <Boton
            variante="peligroso"
            disabled={ocupado}
            onClick={() => alElegir("rechazar", fila.id)}
          >
            Rechazar
          </Boton>
        </div>
      )}
      {editable && fila.estado === ESTADO.ACEPTADA && (
        <div className={estilos.acciones}>
          <Boton
            variante="peligroso"
            disabled={ocupado}
            onClick={() => alElegir("desvincular", fila.id)}
          >
            Desvincular
          </Boton>
        </div>
      )}
    </li>
  );
}
