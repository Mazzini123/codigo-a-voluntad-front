import { useCallback, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PROYECTO_ESTADO } from "../../Application/Domain/Enums/PROYECTO_ESTADO.js";
import { ROL_CUENTA } from "../../Application/Domain/Enums/ROL_CUENTA.js";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { AccionDePerfil } from "../Components/Proyecto/AccionDePerfil.jsx";
import { FranjaDeDueno } from "../Components/Proyecto/FranjaDeDueno.jsx";
import { DialogoDePostulacion } from "../Components/Proyecto/DialogoDePostulacion.jsx";
import {
  idDePostulacion,
  idDeTituloDePerfil,
} from "../Components/Proyecto/idsDePerfil.js";
import { PerfilDelProyecto } from "../Components/Proyecto/PerfilDelProyecto.jsx";
import { SelloDeBusqueda } from "../Components/Proyecto/SelloDeBusqueda.jsx";
import {
  encajeDelPerfil,
  fechaLarga,
  selloDeProyecto,
  perfilesAbiertos,
} from "../Formatos/proyecto.js";
import { useAuth } from "../Hooks/useAuth.js";
import { useEsDuenoDelProyecto } from "../Hooks/useEsDuenoDelProyecto.js";
import { useHabilidadesPropias } from "../Hooks/useHabilidadesPropias.js";
import { usePostulacionesEnProyecto } from "../Hooks/usePostulacionesEnProyecto.js";
import { usePostularse } from "../Hooks/usePostularse.js";
import { useProyecto } from "../Hooks/useProyecto.js";
import estilosDePerfil from "./Perfil.module.css";
import estilos from "./ProyectoPage.module.css";

export function ProyectoPage() {
  const { id } = useParams();
  const { usuario, cargando: verificandoSesion } = useAuth();
  const { proyecto, error, recargar } = useProyecto(id);
  const colaboradoraId =
    usuario?.rol === ROL_CUENTA.COLABORADORA ? usuario.perfilId : null;
  const postulaciones = usePostulacionesEnProyecto(colaboradoraId, id);
  const codigosPropios = useHabilidadesPropias(colaboradoraId);
  const { recargar: recargarPostulaciones } = postulaciones;

  const recargarTodo = useCallback(
    () => Promise.all([recargar(), recargarPostulaciones()]),
    [recargar, recargarPostulaciones],
  );

  if (error?.status === 404) {
    return (
      <MensajeDePantalla
        titulo="No encontramos este proyecto"
        tituloDePestana="Proyecto no encontrado"
        volverA="/proyectos"
        textoVolver="Volver a la búsqueda"
      >
        Puede que el enlace esté mal escrito o que el proyecto ya no esté en la
        plataforma.
      </MensajeDePantalla>
    );
  }
  if (error) {
    return (
      <section className={estilosDePerfil.pagina}>
        <TituloDePagina>Proyecto</TituloDePagina>
        <ErrorState
          nivel={1}
          titulo="No pudimos cargar el proyecto"
          error={error}
          alReintentar={recargar}
        />
      </section>
    );
  }
  if (!proyecto) return <EsqueletoDelProyecto />;

  return (
    <DetalleDelProyecto
      proyecto={proyecto}
      usuario={usuario}
      colaboradoraId={colaboradoraId}
      verificandoSesion={verificandoSesion}
      postulaciones={postulaciones}
      codigosPropios={codigosPropios}
      recargarTodo={recargarTodo}
    />
  );
}

function DetalleDelProyecto({
  proyecto,
  usuario,
  colaboradoraId,
  verificandoSesion,
  postulaciones,
  codigosPropios,
  recargarTodo,
}) {
  const location = useLocation();
  const [hoy] = useState(() => new Date());
  const dueno = useEsDuenoDelProyecto(proyecto.id);
  const [aPostular, setAPostular] = useState(null);
  const perfilPostulado = useRef(null);
  const { postularse, enviando, error, reiniciar } = usePostularse(
    proyecto.id,
    colaboradoraId,
    recargarTodo,
  );
  const volverA = `/proyectos${location.state?.busqueda ?? ""}`;
  const porcentaje = proyecto.porcentajeConcrecion ?? 0;
  const sello = selloDeProyecto(proyecto.estado);
  const sinAvances = porcentaje === 0 && (proyecto.avances ?? []).length === 0;
  const perfiles = proyecto.perfiles ?? [];
  const abiertos = perfilesAbiertos(proyecto, hoy);
  const historicos = perfiles.filter((perfil) => !abiertos.includes(perfil));
  const esColectivoConPerfiles =
    dueno.esColectivo &&
    perfiles.length > 0 &&
    proyecto.estado !== PROYECTO_ESTADO.FINALIZADO;
  const esperandoAcciones =
    verificandoSesion || (colaboradoraId && postulaciones.cargando);

  function abrirDialogo(perfil) {
    reiniciar();
    setAPostular({ perfil, esPublica: true });
  }

  function cerrarDialogo() {
    reiniciar();
    setAPostular(null);
  }

  async function enviar() {
    const registrada = await postularse(aPostular.perfil, aPostular.esPublica);
    if (registrada) {
      perfilPostulado.current = aPostular.perfil.id;
      setAPostular(null);
    }
  }

  const destinoDeFoco = useCallback(() => {
    const perfilId = perfilPostulado.current;
    perfilPostulado.current = null;
    if (!perfilId) return null;
    const destino =
      document.getElementById(idDePostulacion(perfilId)) ??
      document.getElementById(idDeTituloDePerfil(perfilId));
    const historico = destino?.closest("details");
    if (historico) historico.open = true;
    return destino;
  }, []);

  return (
    <article className={estilosDePerfil.pagina} aria-labelledby="titulo-proyecto">
      <TituloDePagina>{proyecto.titulo}</TituloDePagina>
      <EnlaceVolver to={volverA}>Volver a la búsqueda</EnlaceVolver>
      {dueno.esDueno && <FranjaDeDueno />}

      <header className={estilosDePerfil.titulos}>
        <h1 id="titulo-proyecto" tabIndex={-1}>
          {proyecto.titulo}
        </h1>
        <div className={estilosDePerfil.estadoDelProyecto}>
          {sello && <SelloDeBusqueda estado={sello} />}
          <p className={estilosDePerfil.meta}>
            Publicado el{" "}
            <time dateTime={proyecto.fechaCreacion}>
              {fechaLarga(proyecto.fechaCreacion)}
            </time>
          </p>
        </div>
      </header>

      {proyecto.etiquetas?.length > 0 && (
        <ul className={estilosDePerfil.etiquetas} aria-label="Etiquetas">
          {proyecto.etiquetas.map((etiqueta) => (
            <li key={etiqueta} className={estilosDePerfil.etiqueta}>
              {etiqueta}
            </li>
          ))}
        </ul>
      )}
      <p className={estilosDePerfil.descripcion}>{proyecto.descripcion}</p>

      {sinAvances ? (
        <p className={estilosDePerfil.vacio}>Todavía no cargó avances.</p>
      ) : (
        <div className={estilos.avance}>
          <label htmlFor="avance-proyecto">Avance: {porcentaje} %</label>
          <progress id="avance-proyecto" value={porcentaje} max={100} />
        </div>
      )}
      {(proyecto.urlSistema || proyecto.urlRepositorio) && (
        <ul className={estilos.enlaces}>
          {proyecto.urlSistema && (
            <li>
              <EnlaceExterno url={proyecto.urlSistema}>Ver el sistema</EnlaceExterno>
            </li>
          )}
          {proyecto.urlRepositorio && (
            <li>
              <EnlaceExterno url={proyecto.urlRepositorio}>
                Ver el repositorio
              </EnlaceExterno>
            </li>
          )}
        </ul>
      )}

      <section className={estilosDePerfil.seccion} aria-labelledby="perfiles-proyecto">
        <h2 id="perfiles-proyecto">Perfiles del proyecto</h2>
        {dueno.esDueno === false && esColectivoConPerfiles && (
          <p className={estilos.notaDePostulaciones}>
            Las postulaciones son para colaboradoras.
          </p>
        )}
        {perfiles.length > 0 ? (
          <>
            {abiertos.length === 0 && (
              <p className={estilosDePerfil.vacio}>
                {proyecto.estado === PROYECTO_ESTADO.FINALIZADO
                  ? "Este proyecto ya finalizó. Podés consultar sus perfiles."
                  : "No hay perfiles con búsqueda abierta."}
              </p>
            )}
            <GrupoDePerfiles perfiles={abiertos}>{mostrarPerfil}</GrupoDePerfiles>
            {historicos.length > 0 && (
              <details
                key={abiertos.length === 0 ? "sin-abiertos" : "con-abiertos"}
                open={abiertos.length === 0}
                className={estilos.historico}
              >
                <summary>
                  Perfiles que ya no reciben postulaciones ({historicos.length})
                </summary>
                <GrupoDePerfiles perfiles={historicos}>{mostrarPerfil}</GrupoDePerfiles>
              </details>
            )}
          </>
        ) : (
          <p className={estilosDePerfil.vacio}>
            Este proyecto todavía no cargó perfiles.
          </p>
        )}
      </section>

      <DialogoDePostulacion
        perfil={aPostular?.perfil ?? null}
        proyecto={proyecto}
        esPublica={aPostular?.esPublica ?? true}
        enviando={enviando}
        error={error}
        alCambiarVisibilidad={(esPublica) =>
          setAPostular((actual) => ({ ...actual, esPublica }))
        }
        alEnviar={enviar}
        alCancelar={cerrarDialogo}
        destinoDeFoco={destinoDeFoco}
      />
    </article>
  );

  function mostrarPerfil(perfil) {
    const postulacion = postulaciones.postulaciones.find(
      (candidata) => candidata.perfil === perfil.id,
    );
    return (
      <PerfilDelProyecto
        perfil={perfil}
        proyecto={proyecto}
        codigosPropios={codigosPropios}
        encaje={
          codigosPropios && !postulacion
            ? encajeDelPerfil(perfil, proyecto, codigosPropios, hoy)
            : null
        }
        hoy={hoy}
      >
        {esperandoAcciones ? (
          <EsqueletoDeAccion proyecto={proyecto} />
        ) : (
          <AccionDePerfil
            perfil={perfil}
            proyecto={proyecto}
            usuario={usuario}
            postulacion={postulacion}
            alPostular={abrirDialogo}
            hoy={hoy}
          />
        )}
      </PerfilDelProyecto>
    );
  }
}

function GrupoDePerfiles({ perfiles, children }) {
  if (perfiles.length === 0) return null;
  return (
    <ul className={estilos.perfiles}>
      {perfiles.map((perfil) => (
        <li key={perfil.id}>{children(perfil)}</li>
      ))}
    </ul>
  );
}

function EsqueletoDeAccion({ proyecto }) {
  if (proyecto.estado === PROYECTO_ESTADO.FINALIZADO) return null;
  return (
    <span aria-hidden="true" className={estilos.esqueletoDeAccion}>
      <BloqueSkeleton ancho="9rem" alto="var(--toque-minimo)" />
    </span>
  );
}

function EnlaceExterno({ url, children }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
      <TextoOculto> (se abre en otra pestaña)</TextoOculto>
    </a>
  );
}

function EsqueletoDelProyecto() {
  return (
    <section className={estilosDePerfil.pagina}>
      <Skeleton etiqueta="Cargando el proyecto…">
        <div className={estilosDePerfil.seccion}>
          <BloqueSkeleton ancho="60%" alto="2rem" />
          <BloqueSkeleton ancho="30%" />
          <BloqueSkeleton />
          <BloqueSkeleton ancho="70%" />
          {[1, 2].map((numero) => (
            <div key={numero} className={estilos.esqueletoDePerfil}>
              <BloqueSkeleton ancho="50%" alto="1.4em" />
              <BloqueSkeleton ancho="40%" />
              <BloqueSkeleton />
            </div>
          ))}
        </div>
      </Skeleton>
    </section>
  );
}
