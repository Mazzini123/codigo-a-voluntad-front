import { useCallback, useRef, useState } from "react";
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
  datosDelPerfil,
  descripcionDeLaBaja,
  fechaValida,
  filtroDeEstadoValido,
  textoDeContribucion,
  textoDeEstado,
} from "@/Presentation/Formatos/colaboracion.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useMisPostulaciones } from "@/Presentation/Hooks/postulacion/useMisPostulaciones.js";
import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import {
  RUTA_PROYECTOS,
  estadoParaVolver,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./MisPostulacionesPage.module.css";

const ERROR_DE_LA_BAJA = "No pudimos darte de baja. Probá de nuevo.";

export function MisPostulacionesPage() {
  const { usuario } = useSesion();
  const [parametros, setParametros] = useSearchParams();
  const [confirmacion, setConfirmacion] = useState(null);
  const avisar = useAvisos();
  const refTitulo = useRef(null);
  const refBotonDeBaja = useRef(null);
  const { postulaciones, error, reintentar, darDeBaja, procesando } = useMisPostulaciones(
    usuario.perfilId,
  );
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

  function pedirBaja(registro, boton) {
    refBotonDeBaja.current = boton;
    setConfirmacion(registro);
  }

  async function confirmarBaja() {
    const { proyectoId, colaboracion, proyecto } = confirmacion;
    const resultado = await darDeBaja(proyectoId, colaboracion.id);
    if (!resultado) return;
    setConfirmacion(null);
    if (resultado.fallo) {
      avisar.error(resultado.fallo.mensaje ?? ERROR_DE_LA_BAJA);
    } else if (resultado.actualizado) {
      avisar.exito(avisoDeBaja(proyecto));
    } else {
      avisar.exito(`${avisoDeBaja(proyecto)} No pudimos actualizar la lista.`);
    }
  }

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-mis-postulaciones">
      <TituloDePagina>Mis postulaciones</TituloDePagina>
      <div className={estilos.encabezado}>
        <h1 id="titulo-mis-postulaciones" ref={refTitulo} tabIndex={-1}>
          Mis postulaciones
        </h1>
        <p className={estilos.nota}>
          Las postulaciones anónimas todavía no aparecen en esta lista.
        </p>
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
                  alPedirBaja={pedirBaja}
                />
              ))}
            </ul>
          )}
        </>
      )}
      <DialogoDeConfirmacion
        abierto={Boolean(confirmacion)}
        titulo="¿Darte de baja de este proyecto?"
        descripcion={
          confirmacion &&
          descripcionDeLaBaja({
            proyecto: confirmacion.proyecto,
            perfil: datosDelPerfil(
              confirmacion.proyecto,
              confirmacion.colaboracion.perfil,
            ),
            esPublica: confirmacion.colaboracion.esPublica,
          })
        }
        textoConfirmar="Darme de baja"
        textoEnviando="Dándote de baja…"
        permanente
        enviando={procesando}
        destinoDeFoco={destinoDeFoco}
        alConfirmar={confirmarBaja}
        alCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function Fila({ registro, ocupado, alPedirBaja }) {
  const location = useLocation();
  const { proyectoId, colaboracion, proyecto } = registro;
  const perfil = datosDelPerfil(proyecto, colaboracion.perfil);
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
      {proyecto ? (
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
      {colaboracion.estado === ESTADO.ACEPTADA && (
        <div className={estilos.acciones}>
          <Boton
            variante="peligroso"
            disabled={ocupado}
            onClick={(evento) => alPedirBaja(registro, evento.currentTarget)}
          >
            Darme de baja
          </Boton>
        </div>
      )}
    </li>
  );
}
