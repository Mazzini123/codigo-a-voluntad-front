import { Link, useLocation, useParams } from "react-router-dom";
import { COLABORACION_ESTADO } from "@/Application/Domain/Enums/COLABORACION_ESTADO.js";
import { Chip } from "@/Presentation/Components/App/ui/Chip.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { leerUrlExterna } from "@/Presentation/Components/App/ui/urlExterna.js";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import { nombreVisible } from "@/Presentation/Formatos/colaboradora.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useColaboradora } from "@/Presentation/Hooks/colaboradora/useColaboradora.js";
import { useHistorialPublico } from "@/Presentation/Hooks/colaboradora/useHistorialPublico.js";
import {
  destinoDeVuelta,
  estadoParaVolver,
  RUTA_PROYECTOS,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";
import publico from "./ColaboradoraPage.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { sinMarcas } from "@/Presentation/Formatos/markdown.js";

const ESTADOS_DEL_HISTORIAL = {
  [COLABORACION_ESTADO.ACEPTADA]: { tipo: "aceptada", texto: "En curso" },
  [COLABORACION_ESTADO.FINALIZADA]: { tipo: "finalizado", texto: "Finalizada" },
  [COLABORACION_ESTADO.DESVINCULADA]: { tipo: "cerrada", texto: "Desvinculada" },
};

export function ColaboradoraPage() {
  const { id } = useParams();
  const { colaboradora, error, cargando, recargar } = useColaboradora(id);
  const volver = destinoDeVuelta(useLocation(), {
    a: RUTA_PROYECTOS,
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
        <EstadoDeError
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
        <Esqueleto etiqueta="Cargando el perfil…">
          <div className={estilos.seccion}>
            <BloqueEsqueleto ancho="50%" alto="2rem" />
            <BloqueEsqueleto ancho="20%" />
            <BloqueEsqueleto />
            <BloqueEsqueleto ancho="70%" />
          </div>
        </Esqueleto>
      </section>
    );
  }
  return <PerfilPublico key={id} colaboradora={colaboradora} volver={volver} />;
}

function PerfilPublico({ colaboradora, volver }) {
  const nombre = nombreVisible(colaboradora);
  const cuentaGit = colaboradora.cuentaGit?.trim();
  const git = leerUrlExterna(cuentaGit);
  const enlaceGit =
    git?.protocol === "https:" && ["github.com", "gitlab.com"].includes(git.hostname);
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
                  <EnlaceExterno className={estilos.enlace} url={git.href}>
                    Perfil de {git.hostname === "github.com" ? "GitHub" : "GitLab"}
                  </EnlaceExterno>
                ) : (
                  <>Cuenta de GitHub o GitLab: {cuentaGit}</>
                )}
              </p>
            )}
            {colaboradora.redesSociales?.length > 0 && (
              <ul className={publico.redes} aria-label="Redes sociales">
                {colaboradora.redesSociales.map((red) => (
                  <li key={red.url}>
                    <EnlaceExterno className={estilos.enlace} url={red.url}>
                      {red.nombre}
                    </EnlaceExterno>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={clases(estilos.meta, publico.privacidad)}>
            Sus datos de contacto se comparten cuando un colectivo acepta su postulación.
          </p>
        </header>

        <section
          className={clases(estilos.panel, publico.habilidades)}
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
  const {
    historial: datos,
    error,
    cargando,
    reintentar,
  } = useHistorialPublico(colaboradoraId);

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
        <EstadoDeError
          nivel={3}
          titulo="No pudimos cargar las colaboraciones"
          error={error}
          alReintentar={reintentar}
        />
      ) : cargando ? (
        <Esqueleto etiqueta="Cargando las colaboraciones…">
          <div className={estilos.panel}>
            <BloqueEsqueleto ancho="50%" />
            <BloqueEsqueleto />
          </div>
        </Esqueleto>
      ) : datos?.length > 0 ? (
        <ul className={publico.historial}>
          {datos.map(({ proyecto, colaboracion }) => (
            <li key={colaboracion.id}>
              <TarjetaDeColaboracion proyecto={proyecto} colaboracion={colaboracion} />
            </li>
          ))}
        </ul>
      ) : (
        <EstadoVacio nivel={3} titulo="Todavía no hay colaboraciones públicas." />
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
    <article className={clases(estilos.panel, publico.tarjeta)}>
      <div className={estilos.seccion}>
        <h3>{proyecto?.titulo ?? "Proyecto no disponible"}</h3>
        {proyecto?.descripcion && (
          <p className={publico.resumen}>{sinMarcas(proyecto.descripcion)}</p>
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
            className={clases(estilos.enlace, publico.verProyecto)}
            to={rutaProyecto(proyecto.id)}
            state={estadoParaVolver(location, "Volver al perfil de colaboradora")}
          >
            Ver proyecto<TextoOculto> {proyecto.titulo}</TextoOculto>
          </Link>
        )}
      </div>
    </article>
  );
}
