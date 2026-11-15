import { useCallback, useRef, useState } from "react";
import { AccionesDeColaboracion } from "@/Presentation/Components/Valoracion/AccionesDeColaboracion.jsx";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { COLABORACION_ESTADO as ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { DialogoDeConfirmacion } from "@/Presentation/Components/App/dialogos/DialogoDeConfirmacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { Selector } from "@/Presentation/Components/App/ui/Selector.jsx";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import {
  ESTADOS,
  avisoDeBaja,
  avisoDeRetiro,
  datosDelPerfil,
  descripcionDeLaBaja,
  descripcionDelRetiro,
  fechaValida,
  filtroDeEstadoValido,
  textoDeContribucion,
  textoDeEstado,
} from "@/Presentation/Formatos/colaboracion.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMisPostulaciones } from "@/Presentation/Hooks/postulacion/useMisPostulaciones.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import {
  RUTA_PROYECTOS,
  estadoParaVolver,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./MisPostulacionesPage.module.css";

const ERROR_DE_LA_BAJA = "No pudimos darte de baja. Probá de nuevo.";
const ERROR_DEL_RETIRO = "No pudimos retirar tu postulación. Probá de nuevo.";

export function MisPostulacionesPage() {
  const { usuario } = useAuth();
  const [parametros, setParametros] = useSearchParams();
  const [confirmacion, setConfirmacion] = useState(null);
  const avisar = useAvisos();
  const refTitulo = useRef(null);
  const refBotonDeBaja = useRef(null);
  const { postulaciones, error, reintentar, darDeBaja, retirarPostulacion, procesando } =
    useMisPostulaciones(usuario.perfilId);
  const filtro = filtroDeEstadoValido(parametros.get("estado"));
  const visibles = (postulaciones ?? []).filter(
    ({ colaboracion }) => !filtro || colaboracion.estado === filtro,
  );

  const destinoDeFoco = useCallback(
    () =>
      refBotonDeBaja.current?.isConnected ? refBotonDeBaja.current : refTitulo.current,
    [],
  );

  function cambiarFiltro(valor) {
    const siguientes = new URLSearchParams(parametros);
    if (valor) siguientes.set("estado", valor);
    else siguientes.delete("estado");
    setParametros(siguientes);
  }

  function pedirAccion(tipo, registro, boton) {
    refBotonDeBaja.current = boton;
    setConfirmacion({ tipo, registro });
  }

  async function confirmarAccion() {
    const { tipo, registro } = confirmacion;
    const { proyectoId, colaboracion, proyecto } = registro;
    const esRetiro = tipo === "retiro";
    const resultado = await (esRetiro ? retirarPostulacion : darDeBaja)(
      proyectoId,
      colaboracion.id,
    );
    if (!resultado) return;
    setConfirmacion(null);
    const aviso = esRetiro ? avisoDeRetiro(proyecto) : avisoDeBaja(proyecto);
    if (resultado.fallo) {
      avisar.error(
        resultado.fallo.mensaje ?? (esRetiro ? ERROR_DEL_RETIRO : ERROR_DE_LA_BAJA),
      );
    } else if (resultado.actualizado) {
      avisar.exito(aviso);
    } else {
      avisar.exito(`${aviso} No pudimos actualizar la lista.`);
    }
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-mis-postulaciones">
      <TituloDePagina>Mis postulaciones</TituloDePagina>
      <div className={estilos.encabezado}>
        <h1 id="titulo-mis-postulaciones" ref={refTitulo} tabIndex={-1}>
          Mis postulaciones
        </h1>
      </div>
      {error ? (
        <EstadoDeError
          titulo="No pudimos cargar tus postulaciones"
          error={error}
          alReintentar={reintentar}
        />
      ) : !postulaciones ? (
        <Esqueleto etiqueta="Cargando tus postulaciones…">
          <BloqueEsqueleto alto="2.75rem" ancho="16rem" />
          <BloqueEsqueleto alto="7rem" />
          <BloqueEsqueleto alto="7rem" />
        </Esqueleto>
      ) : postulaciones.length === 0 ? (
        <EstadoVacio titulo="Todavía no te postulaste a ningún proyecto">
          <EnlaceBoton variante="primario" to={RUTA_PROYECTOS}>
            Buscar proyectos
          </EnlaceBoton>
        </EstadoVacio>
      ) : (
        <>
          <div className={estilos.filtro}>
            <Selector
              etiqueta="Estado de la postulación"
              opciones={ESTADOS}
              value={filtro}
              onChange={(evento) => cambiarFiltro(evento.target.value)}
              disabled={procesando}
            />
          </div>
          {visibles.length === 0 ? (
            <EstadoVacio titulo="No tenés postulaciones con este estado.">
              <Boton onClick={() => cambiarFiltro("")}>Ver todas</Boton>
            </EstadoVacio>
          ) : (
            <ul className={estilos.lista}>
              {visibles.map((registro) => (
                <Fila
                  key={registro.colaboracion.id}
                  registro={registro}
                  ocupado={procesando}
                  alPedirAccion={pedirAccion}
                  alActualizar={reintentar}
                />
              ))}
            </ul>
          )}
        </>
      )}
      <DialogoDeConfirmacion
        abierto={Boolean(confirmacion)}
        titulo={
          confirmacion?.tipo === "retiro"
            ? "¿Retirar tu postulación?"
            : "¿Darte de baja de este proyecto?"
        }
        descripcion={confirmacion && descripcionDeLaAccion(confirmacion)}
        textoConfirmar={confirmacion?.tipo === "retiro" ? "Retirar" : "Darme de baja"}
        textoEnviando={
          confirmacion?.tipo === "retiro" ? "Retirando…" : "Dándote de baja…"
        }
        permanente={confirmacion?.tipo !== "retiro"}
        enviando={procesando}
        destinoDeFoco={destinoDeFoco}
        alConfirmar={confirmarAccion}
        alCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function descripcionDeLaAccion({ tipo, registro }) {
  const { proyecto, colaboracion, perfil: resumen } = registro;
  const perfil = datosDelPerfil(proyecto, colaboracion.perfil, resumen);
  if (tipo === "retiro") return descripcionDelRetiro({ proyecto, perfil });
  return descripcionDeLaBaja({ proyecto, perfil, esPublica: colaboracion.esPublica });
}

function Fila({ registro, ocupado, alPedirAccion, alActualizar }) {
  const location = useLocation();
  const { proyectoId, colaboracion, proyecto } = registro;
  const perfil = datosDelPerfil(proyecto, colaboracion.perfil, registro.perfil);
  return (
    <li className={estilos.fila}>
      <h2 className={estilos.titulo}>
        <Link
          className={estilos.enlace}
          to={rutaProyecto(proyectoId)}
          state={estadoParaVolver(location, "Volver a mis postulaciones")}
        >
          {proyecto?.titulo ?? "Ver el proyecto"}
        </Link>
      </h2>
      {proyecto || perfil ? (
        <p className={estilos.perfil}>
          <strong>{perfil.titulo}</strong>
          {perfil.descripcion && (
            <span className={estilos.recortada}>{perfil.descripcion}</span>
          )}
        </p>
      ) : (
        <p className={estilos.aviso}>No pudimos cargar los datos de este proyecto.</p>
      )}
      <p className={estilos.estados}>
        <strong className={clases(estilos.estado, estilos[colaboracion.estado])}>
          {textoDeEstado(colaboracion.estado)}
        </strong>
        <span>{textoDeContribucion(colaboracion.esPublica)}</span>
      </p>
      <p className={estilos.fechas}>
        {fechaValida(colaboracion.fecha) && (
          <span>
            Te postulaste el{" "}
            <time dateTime={colaboracion.fecha}>{fechaLarga(colaboracion.fecha)}</time>
          </span>
        )}
        {fechaValida(colaboracion.fechaFin) && (
          <span>
            Terminó el{" "}
            <time dateTime={colaboracion.fechaFin}>
              {fechaLarga(colaboracion.fechaFin)}
            </time>
          </span>
        )}
      </p>
      <AccionesDeColaboracion
        proyectoId={proyectoId}
        colaboracion={colaboracion}
        ocupado={ocupado}
        alActualizar={alActualizar}
      />
      {colaboracion.estado === ESTADO.ACEPTADA && (
        <div className={estilos.acciones}>
          <Boton
            variante="peligroso"
            disabled={ocupado}
            onClick={(evento) => alPedirAccion("baja", registro, evento.currentTarget)}
          >
            Darme de baja
          </Boton>
        </div>
      )}
      {colaboracion.estado === ESTADO.PENDIENTE && (
        <div className={estilos.acciones}>
          <Boton
            disabled={ocupado}
            onClick={(evento) => alPedirAccion("retiro", registro, evento.currentTarget)}
          >
            Retirar postulación
          </Boton>
        </div>
      )}
    </li>
  );
}
