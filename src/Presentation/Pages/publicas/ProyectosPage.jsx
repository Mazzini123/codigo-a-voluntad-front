import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ilustracion from "@/assets/explorar-proyectos.webp";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { Esqueleto } from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import {
  TarjetaProyecto,
  TarjetaProyectoSkeleton,
} from "@/Presentation/Components/Proyecto/listado/TarjetaProyecto.jsx";
import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import { useBusquedaDeProyectos } from "@/Presentation/Hooks/proyecto/useBusquedaDeProyectos.js";
import { useHabilidadesPropias } from "@/Presentation/Hooks/colaboradora/useHabilidadesPropias.js";
import {
  useParametrosDeBusqueda,
  VISTA,
} from "@/Presentation/Hooks/proyecto/useParametrosDeBusqueda.js";
import { useProyectosPostulados } from "@/Presentation/Hooks/postulacion/useProyectosPostulados.js";
import estilos from "./ProyectosPage.module.css";
import { RUTA_PERFIL_COLABORADORA } from "@/Presentation/Routes/rutas.js";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

const AYUDA_DE_ETIQUETA = "Por ejemplo: educación, salud, ambiente.";
const AYUDA_EN_PARA_VOS = "La búsqueda por etiqueta se hace sobre todos los proyectos.";

export function ProyectosPage() {
  const { usuario, cargando: verificandoSesion, errorDeCuenta } = useSesion();
  const esColaboradora = usuario?.rol === ROL_CUENTA.COLABORADORA;
  const busqueda = useParametrosDeBusqueda({ puedeVerParaVos: esColaboradora });
  const proyectos = useBusquedaDeProyectos({
    vista: busqueda.vista,
    etiqueta: busqueda.etiqueta,
    pagina: busqueda.pagina,
    colaboradoraId: usuario?.perfilId,
    listo: !verificandoSesion || Boolean(errorDeCuenta),
  });

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <div>
          <h1 tabIndex={-1} className={estilos.titulo}>
            Proyectos de colectivos sociales
          </h1>
          <p className={estilos.bajada}>
            Conocé iniciativas que necesitan apoyo tecnológico y encontrá cómo aportar tus
            habilidades.
          </p>
        </div>
        <img
          className={estilos.ilustracion}
          src={ilustracion}
          alt=""
          width="1200"
          height="315"
        />
      </header>

      <div className={estilos.controles}>
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
      </div>

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
  const { total, pagina, totalPaginas } = resultado;
  if (totalPaginas >= 1 && busqueda.pagina > totalPaginas) return "";
  if (resultado.items.length === 0) {
    if (busqueda.etiqueta)
      return `No encontramos proyectos con la etiqueta «${busqueda.etiqueta}»`;
    if (busqueda.vista === VISTA.PARA_VOS)
      return "Todavía no hay proyectos que encajen con tus habilidades";
    return "Todavía no hay proyectos publicados";
  }
  const conteo = `${total} ${total === 1 ? "proyecto" : "proyectos"}`;
  const conEtiqueta = busqueda.etiqueta ? ` con la etiqueta «${busqueda.etiqueta}»` : "";
  const conPagina = totalPaginas > 1 ? `, página ${pagina} de ${totalPaginas}` : "";
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
    resultado.items.length === 0 &&
    resultado.totalPaginas >= 1 &&
    busqueda.pagina > resultado.totalPaginas;

  const { irAPagina } = busqueda;
  useEffect(() => {
    if (fueraDeRango) irAPagina(resultado.totalPaginas, { reemplazar: true });
  }, [fueraDeRango, irAPagina, resultado]);

  function cambiarPagina(numero) {
    busqueda.irAPagina(numero);
    refConteo.current?.focus();
  }

  const titulo = <h2 className={estilos.oculto}>Resultados</h2>;

  if (error) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <EstadoDeError
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
        <Esqueleto etiqueta="Cargando proyectos…">
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
        </Esqueleto>
      </section>
    );
  }

  if (!resultado) return null;

  if (resultado.items.length === 0) {
    return (
      <section className={estilos.resultados}>
        {titulo}
        <SinProyectos busqueda={busqueda} />
      </section>
    );
  }

  const { pagina, porPagina, total, totalPaginas } = resultado;
  const desde = (pagina - 1) * porPagina + 1;
  const hasta = desde + resultado.items.length - 1;

  return (
    <section className={estilos.resultados} aria-busy={cargando}>
      {titulo}
      <div className={estilos.encabezadoDeConteo}>
        <p ref={refConteo} tabIndex={-1} className={estilos.conteo}>
          {totalPaginas > 1
            ? `Mostrando ${desde}–${hasta} de ${total} proyectos`
            : total === 1
              ? "1 proyecto encontrado"
              : `${total} proyectos encontrados`}
        </p>
        {cargando && (
          <p className={estilos.cargandoPagina}>Cargando página {busqueda.pagina}…</p>
        )}
      </div>
      <ul
        className={clases(estilos.grilla, cargando && estilos.atenuada)}
        inert={cargando}
        aria-hidden={cargando || undefined}
      >
        {resultado.items.map((proyecto) => (
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
        pagina={pagina}
        totalPaginas={totalPaginas}
        alCambiar={cambiarPagina}
      />
    </section>
  );
}

function TemasDeBusqueda({ proyectos, busqueda }) {
  if (proyectos.cargando || proyectos.error) return null;
  const temas = [
    ...new Set(
      proyectos.resultado?.items.flatMap((proyecto) => proyecto.etiquetas ?? []) ?? [],
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
      <EstadoVacio
        nivel={3}
        titulo={`No encontramos proyectos con la etiqueta «${busqueda.etiqueta}»`}
        descripcion="Probá con otra palabra o mirá todos los proyectos."
      >
        <Boton onClick={busqueda.limpiar}>Limpiar búsqueda</Boton>
      </EstadoVacio>
    );
  }
  if (busqueda.vista === VISTA.PARA_VOS) {
    return (
      <EstadoVacio
        nivel={3}
        titulo="Todavía no hay proyectos que encajen con tus habilidades"
        descripcion={
          <>
            Podés <Link to={RUTA_PERFIL_COLABORADORA}>sumar habilidades</Link> a tu perfil
            para que encajen más proyectos.
          </>
        }
      >
        <EnlaceBoton to={busqueda.enlaceDeVista(VISTA.TODOS)}>
          Ver todos los proyectos
        </EnlaceBoton>
      </EstadoVacio>
    );
  }
  return (
    <EstadoVacio
      nivel={3}
      titulo="Todavía no hay proyectos publicados"
      descripcion="Cuando un colectivo publique un proyecto, va a aparecer acá."
    />
  );
}
