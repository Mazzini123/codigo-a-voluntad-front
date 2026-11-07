import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { Boton } from "../Components/App/Boton.jsx";
import { Campo } from "../Components/App/Campo.jsx";
import { EmptyState } from "../Components/App/EmptyState.jsx";
import { EnlaceBoton } from "../Components/App/EnlaceBoton.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Paginacion } from "../Components/App/Paginacion.jsx";
import { Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import {
  TarjetaProyecto,
  TarjetaProyectoSkeleton,
} from "../Components/Proyecto/TarjetaProyecto.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useBusquedaDeProyectos } from "../Hooks/useBusquedaDeProyectos.js";
import { useHabilidadesPropias } from "../Hooks/useHabilidadesPropias.js";
import { useParametrosDeBusqueda, VISTA } from "../Hooks/useParametrosDeBusqueda.js";
import { useProyectosPostulados } from "../Hooks/useProyectosPostulados.js";
import estilos from "./ProyectosPage.module.css";

const AYUDA_DE_ETIQUETA = "Por ejemplo: educación, salud, ambiente.";
const AYUDA_EN_PARA_VOS = "La búsqueda por etiqueta se hace sobre todos los proyectos.";

export function ProyectosPage() {
  const { usuario, cargando: verificandoSesion } = useAuth();
  const esColaboradora = usuario?.rol === ROL_CUENTA.COLABORADORA;
  const busqueda = useParametrosDeBusqueda({ puedeVerParaVos: esColaboradora });
  const proyectos = useBusquedaDeProyectos({
    vista: busqueda.vista,
    etiqueta: busqueda.etiqueta,
    pagina: busqueda.pagina,
    colaboradoraId: usuario?.perfilId,
    listo: !verificandoSesion,
  });

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 tabIndex={-1} className={estilos.titulo}>
          Proyectos de colectivos sociales
        </h1>
        <p className={estilos.bajada}>
          Sumate con lo que sabés hacer a proyectos de colectivos sociales.
        </p>
      </header>

      <form
        role="search"
        aria-label="Buscar proyectos"
        className={estilos.buscador}
        onSubmit={(e) => {
          e.preventDefault();
          busqueda.aplicarAhora();
        }}
      >
        <Campo
          etiqueta="Buscar por etiqueta"
          type="search"
          autoComplete="off"
          ayuda={
            busqueda.vista === VISTA.PARA_VOS
              ? `${AYUDA_DE_ETIQUETA} ${AYUDA_EN_PARA_VOS}`
              : AYUDA_DE_ETIQUETA
          }
          value={busqueda.texto}
          onChange={(e) => busqueda.escribir(e.target.value)}
        />
        {busqueda.texto && <Boton onClick={busqueda.limpiar}>Limpiar</Boton>}
      </form>

      <TemasDeBusqueda proyectos={proyectos} busqueda={busqueda} />

      {esColaboradora && (
        <nav aria-label="Vistas de proyectos">
          <ul className={estilos.vistas}>
            <li>
              <Link
                to={busqueda.enlaceDeVista(VISTA.PARA_VOS)}
                className={estilos.vista}
                aria-current={busqueda.vista === VISTA.PARA_VOS ? "page" : undefined}
              >
                Para vos
              </Link>
            </li>
            <li>
              <Link
                to={busqueda.enlaceDeVista(VISTA.TODOS)}
                className={estilos.vista}
                aria-current={busqueda.vista === VISTA.TODOS ? "page" : undefined}
              >
                Todos los proyectos
              </Link>
            </li>
          </ul>
        </nav>
      )}

      <Resultados
        busqueda={busqueda}
        proyectos={proyectos}
        colaboradoraId={esColaboradora ? usuario.perfilId : null}
      />
    </div>
  );
}

function textoDeAnuncio({ error, resultado, desactualizado, busqueda }) {
  if (error || !resultado || desactualizado) return "";
  const { total, page, total_pages } = resultado.meta;
  if (total_pages >= 1 && busqueda.pagina > total_pages) return "";
  if (resultado.data.length === 0) {
    if (busqueda.etiqueta)
      return `No encontramos proyectos con la etiqueta «${busqueda.etiqueta}»`;
    if (busqueda.vista === VISTA.PARA_VOS)
      return "Todavía no hay proyectos que encajen con tus habilidades";
    return "Todavía no hay proyectos publicados";
  }
  const conteo = `${total} ${total === 1 ? "proyecto" : "proyectos"}`;
  const conEtiqueta = busqueda.etiqueta ? ` con la etiqueta «${busqueda.etiqueta}»` : "";
  const conPagina = total_pages > 1 ? `, página ${page} de ${total_pages}` : "";
  return `${conteo}${conEtiqueta}${conPagina}`;
}

function Resultados({ busqueda, proyectos, colaboradoraId }) {
  const { resultado, error } = proyectos;
  const desactualizado =
    !resultado || resultado.consulta !== `${busqueda.vista}|${busqueda.etiqueta}`;
  const anuncio = textoDeAnuncio({ error, resultado, desactualizado, busqueda });
  return (
    <>
      <TextoOculto role="status">{anuncio}</TextoOculto>
      <ListaDeResultados
        busqueda={busqueda}
        proyectos={proyectos}
        colaboradoraId={colaboradoraId}
      />
    </>
  );
}

function ListaDeResultados({ busqueda, proyectos, colaboradoraId }) {
  const refConteo = useRef(null);
  const { resultado, error, cargando, reintentar } = proyectos;
  const consultaActual = `${busqueda.vista}|${busqueda.etiqueta}`;
  const desactualizado = !resultado || resultado.consulta !== consultaActual;
  const codigosPropios = useHabilidadesPropias(colaboradoraId);
  const proyectosPostulados = useProyectosPostulados(colaboradoraId);

  const fueraDeRango =
    resultado &&
    !cargando &&
    !desactualizado &&
    resultado.data.length === 0 &&
    resultado.meta.total_pages >= 1 &&
    busqueda.pagina > resultado.meta.total_pages;

  const { irAPagina } = busqueda;
  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.meta.total_pages, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  function cambiarPagina(numero) {
    busqueda.irAPagina(numero);
    refConteo.current?.focus();
  }

  const titulo = <h2 className={estilos.oculto}>Resultados</h2>;

  if (error) {
    return (
      <section className={estilos.resultados}>
        <ErrorState
          titulo="No pudimos cargar los proyectos"
          error={error}
          alReintentar={reintentar}
        />
      </section>
    );
  }

  if ((cargando && desactualizado) || fueraDeRango) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <Skeleton etiqueta="Cargando proyectos…">
          <ul className={estilos.grilla}>
            {[1, 2, 3, 4, 5, 6].map((numero) => (
              <li
                key={numero}
                className={numero > 2 ? estilos.soloEscritorio : undefined}
              >
                <TarjetaProyectoSkeleton />
              </li>
            ))}
          </ul>
        </Skeleton>
      </section>
    );
  }

  if (!resultado) return null;

  if (resultado.data.length === 0) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <SinProyectos busqueda={busqueda} />
      </section>
    );
  }

  const { page, per_page, total, total_pages } = resultado.meta;
  const desde = (page - 1) * per_page + 1;
  const hasta = desde + resultado.data.length - 1;

  return (
    <section className={estilos.resultados} aria-busy={cargando}>
      {titulo}
      <div className={estilos.encabezadoDeConteo}>
        <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
          Mostrando {desde}–{hasta} de {total} {total === 1 ? "proyecto" : "proyectos"}
        </p>
        {cargando && (
          <p className={estilos.cargandoPagina}>Cargando página {busqueda.pagina}…</p>
        )}
      </div>
      <ul
        className={`${estilos.grilla} ${cargando ? estilos.atenuada : ""}`}
        inert={cargando}
        aria-hidden={cargando || undefined}
      >
        {resultado.data.map((proyecto) => (
          <li key={proyecto.id}>
            <TarjetaProyecto
              proyecto={proyecto}
              codigosPropios={codigosPropios}
              postulaciones={proyectosPostulados.get(proyecto.id)}
            />
          </li>
        ))}
      </ul>
      <Paginacion
        etiqueta="Paginación de proyectos"
        pagina={page}
        totalPaginas={total_pages}
        alCambiar={cambiarPagina}
      />
    </section>
  );
}

function TemasDeBusqueda({ proyectos, busqueda }) {
  if (proyectos.cargando || proyectos.error) return null;
  const temas = [
    ...new Set(
      proyectos.resultado?.data.flatMap((proyecto) => proyecto.etiquetas ?? []) ?? [],
    ),
  ];
  if (temas.length === 0) return null;
  return (
    <section aria-label="Temas de los resultados" className={estilos.temas}>
      <p>Buscá por tema</p>
      <ul>
        {temas.map((tema) => (
          <li key={tema}>
            <button
              type="button"
              aria-pressed={busqueda.etiqueta === tema}
              onClick={() => busqueda.elegirEtiqueta(tema)}
            >
              {tema}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SinProyectos({ busqueda }) {
  if (busqueda.etiqueta) {
    return (
      <EmptyState
        nivel={3}
        titulo={`No encontramos proyectos con la etiqueta «${busqueda.etiqueta}»`}
        descripcion="Probá con otra palabra o mirá todos los proyectos."
      >
        <Boton onClick={busqueda.limpiar}>Limpiar búsqueda</Boton>
      </EmptyState>
    );
  }
  if (busqueda.vista === VISTA.PARA_VOS) {
    return (
      <EmptyState
        nivel={3}
        titulo="Todavía no hay proyectos que encajen con tus habilidades"
        descripcion={
          <>
            Podés <Link to="/colaboradora/perfil">sumar habilidades</Link> a tu perfil
            para que encajen más proyectos.
          </>
        }
      >
        <EnlaceBoton to={busqueda.enlaceDeVista(VISTA.TODOS)}>
          Ver todos los proyectos
        </EnlaceBoton>
      </EmptyState>
    );
  }
  return (
    <EmptyState
      nivel={3}
      titulo="Todavía no hay proyectos publicados"
      descripcion="Cuando un colectivo publique un proyecto, va a aparecer acá."
    />
  );
}
