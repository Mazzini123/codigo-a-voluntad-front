import { useCallback } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { COLABORACION_ESTADO } from "../../Application/Domain/Enums/COLABORACION_ESTADO.js";
import { Chip } from "../Components/App/Chip.jsx";
import { EmptyState } from "../Components/App/EmptyState.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { SelloDeBusqueda } from "../Components/Proyecto/SelloDeBusqueda.jsx";
import { colaboracionDependencies } from "../Dependencies/colaboracionDependencies.js";
import { proyectoDependencies } from "../Dependencies/proyectoDependencies.js";
import { nombreVisible } from "../Formatos/colaboradora.js";
import { fechaLarga } from "../Formatos/proyecto.js";
import { useAsync } from "../Hooks/useAsync.js";
import { useColaboradora } from "../Hooks/useColaboradora.js";
import { destinoDeVuelta, estadoParaVolver } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";
import publico from "./ColaboradoraPage.module.css";

const ESTADOS_DEL_HISTORIAL = {
  [COLABORACION_ESTADO.ACEPTADA]: { tipo: "aceptada", texto: "En curso" },
  [COLABORACION_ESTADO.FINALIZADA]: { tipo: "finalizado", texto: "Finalizada" },
  [COLABORACION_ESTADO.DESVINCULADA]: { tipo: "cerrada", texto: "Desvinculada" },
};

export function ColaboradoraPage() {
  const { id } = useParams();
  const { colaboradora, error, cargando, recargar } = useColaboradora(id);
  const volver = destinoDeVuelta(useLocation(), {
    a: "/proyectos",
    texto: "Volver a los proyectos",
  });

  if (error?.status === 404) {
    return (
      <MensajeDePantalla
        titulo="No encontramos esta colaboradora"
        tituloDePestana="Colaboradora no encontrada"
        volverA={volver.a}
        estadoVolver={volver.state}
        textoVolver={volver.texto}
      >
        Puede que el enlace esté mal escrito o que el perfil ya no esté en la plataforma.
      </MensajeDePantalla>
    );
  }
  if (error) {
    return (
      <section className={estilos.pagina}>
        <TituloDePagina>Colaboradora</TituloDePagina>
        <ErrorState
          nivel={1}
          titulo="No pudimos cargar el perfil"
          error={error}
          alReintentar={recargar}
        />
      </section>
    );
  }
  if (cargando || !colaboradora) {
    return (
      <section className={estilos.pagina}>
        <Skeleton etiqueta="Cargando el perfil…">
          <div className={estilos.seccion}>
            <BloqueSkeleton ancho="50%" alto="2rem" />
            <BloqueSkeleton ancho="20%" />
            <BloqueSkeleton />
            <BloqueSkeleton ancho="70%" />
          </div>
        </Skeleton>
      </section>
    );
  }
  return <PerfilPublico key={id} colaboradora={colaboradora} volver={volver} />;
}

function PerfilPublico({ colaboradora, volver }) {
  const nombre = nombreVisible(colaboradora);
  const cuentaGit = colaboradora.cuentaGit?.trim();
  const git = cuentaGit && URL.canParse(cuentaGit) ? new URL(cuentaGit) : null;
  const enlaceGit =
    git?.protocol === "https:" &&
    !git.username &&
    !git.password &&
    ["github.com", "gitlab.com"].includes(git.hostname);
  return (
    <article className={publico.pagina} aria-labelledby="nombre-colaboradora">
      <TituloDePagina>{nombre}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <div className={publico.cabecera}>
        <header className={publico.identidad}>
          <div className={publico.presentacion}>
            <h1 id="nombre-colaboradora" tabIndex={-1}>
              {nombre}
            </h1>
            <p className={estilos.meta}>Colaboradora</p>
            {colaboradora.pronombres?.length > 0 && (
              <p className={estilos.meta}>
                Pronombres: {colaboradora.pronombres.join(", ")}
              </p>
            )}
            {colaboradora.presentacion && (
              <p className={estilos.descripcion}>{colaboradora.presentacion}</p>
            )}
            {cuentaGit && (
              <p className={estilos.meta}>
                {enlaceGit ? (
                  <a
                    className={estilos.enlace}
                    href={git.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Perfil de {git.hostname === "github.com" ? "GitHub" : "GitLab"}
                    <TextoOculto> (se abre en otra pestaña)</TextoOculto>
                  </a>
                ) : (
                  <>Cuenta de GitHub o GitLab: {cuentaGit}</>
                )}
              </p>
            )}
            {colaboradora.redesSociales?.length > 0 && (
              <ul className={publico.redes} aria-label="Redes sociales">
                {colaboradora.redesSociales.map((red) => (
                  <li key={red.url}>
                    <a
                      className={estilos.enlace}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {red.nombre}
                      <TextoOculto> (se abre en otra pestaña)</TextoOculto>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={`${estilos.meta} ${publico.privacidad}`}>
            Sus datos de contacto se comparten cuando un colectivo acepta su postulación.
          </p>
        </header>

        <section
          className={`${estilos.panel} ${publico.habilidades}`}
          aria-labelledby="habilidades-colaboradora"
        >
          <h2 id="habilidades-colaboradora">Habilidades</h2>
          {colaboradora.habilidades?.length > 0 ? (
            <ul className={estilos.chips}>
              {colaboradora.habilidades.map((habilidad) => (
                <li key={habilidad.codigo}>
                  <Chip>{habilidad.titulo}</Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.vacio}>Todavía no cargó habilidades.</p>
          )}
        </section>
      </div>
      <Historial colaboradoraId={colaboradora.id} />
    </article>
  );
}

function Historial({ colaboradoraId }) {
  const consultar = useCallback(
    async (signal) => {
      const registros = await colaboracionDependencies.listarColaboracionesDeColaborador(
        colaboradoraId,
        { signal },
      );
      const publicas = registros.filter(
        ({ colaboracion }) =>
          colaboracion.esPublica === true &&
          Object.hasOwn(ESTADOS_DEL_HISTORIAL, colaboracion.estado),
      );
      const ids = [...new Set(publicas.map(({ proyectoId }) => proyectoId))];
      const resultados = await Promise.allSettled(
        ids.map((id) => proyectoDependencies.obtenerProyecto(id, { signal })),
      );
      const proyectos = new Map(
        ids.map((id, indice) => {
          const resultado = resultados[indice];
          return [id, resultado.status === "fulfilled" ? resultado.value : null];
        }),
      );
      return publicas.map(({ proyectoId, colaboracion }) => ({
        colaboracion,
        proyecto: proyectos.get(proyectoId),
      }));
    },
    [colaboradoraId],
  );
  const { datos, error, cargando, reintentar } = useAsync(consultar);

  return (
    <section className={estilos.seccion} aria-labelledby="colaboraciones-publicas">
      <div className={publico.tituloDeSeccion}>
        <div>
          <h2 id="colaboraciones-publicas">Colaboraciones</h2>
          <p className={estilos.meta}>
            Proyectos en los que participó como colaboradora.
          </p>
        </div>
        {!error && datos?.length > 0 && (
          <p className={estilos.meta}>
            {datos.length === 1 ? "1 colaboración" : `${datos.length} colaboraciones`}
          </p>
        )}
      </div>
      {error ? (
        <ErrorState
          nivel={3}
          titulo="No pudimos cargar las colaboraciones"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando ? (
        <Skeleton etiqueta="Cargando las colaboraciones…">
          <div className={estilos.panel}>
            <BloqueSkeleton ancho="50%" />
            <BloqueSkeleton />
          </div>
        </Skeleton>
      ) : datos?.length > 0 ? (
        <ul className={publico.historial}>
          {datos.map(({ proyecto, colaboracion }) => (
            <li key={colaboracion.id}>
              <TarjetaDeColaboracion proyecto={proyecto} colaboracion={colaboracion} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState nivel={3} titulo="Todavía no hay colaboraciones públicas." />
      )}
    </section>
  );
}

function TarjetaDeColaboracion({ proyecto, colaboracion }) {
  const location = useLocation();
  const rol = proyecto?.perfiles?.find(
    ({ id }) => id === colaboracion.perfil,
  )?.descripcion;
  const { fechaResolucion, fechaFin } = colaboracion;
  return (
    <article className={`${estilos.panel} ${publico.tarjeta}`}>
      <div className={estilos.seccion}>
        <h3>{proyecto?.titulo ?? "Proyecto no disponible"}</h3>
        {proyecto?.descripcion && (
          <p className={publico.resumen}>{proyecto.descripcion}</p>
        )}
      </div>
      <div className={publico.detalles}>
        <SelloDeBusqueda estado={ESTADOS_DEL_HISTORIAL[colaboracion.estado]} />
        {(rol || fechaResolucion || fechaFin) && (
          <dl>
            {rol && (
              <div className={publico.rol}>
                <dt>Rol</dt>
                <dd>{rol}</dd>
              </div>
            )}
            {fechaResolucion && (
              <div>
                <dt>Inicio</dt>
                <dd>
                  <time dateTime={fechaResolucion}>{fechaLarga(fechaResolucion)}</time>
                </dd>
              </div>
            )}
            {fechaFin && (
              <div>
                <dt>Fin</dt>
                <dd>
                  <time dateTime={fechaFin}>{fechaLarga(fechaFin)}</time>
                </dd>
              </div>
            )}
          </dl>
        )}
        {proyecto && (
          <Link
            className={`${estilos.enlace} ${publico.verProyecto}`}
            to={`/proyectos/${proyecto.id}`}
            state={estadoParaVolver(location, "Volver al perfil de colaboradora")}
          >
            Ver proyecto<TextoOculto> {proyecto.titulo}</TextoOculto>
          </Link>
        )}
      </div>
    </article>
  );
}
