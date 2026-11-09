import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import { ROL_CUENTA } from "@/Application/Domain/Enums/ROL_CUENTA.js";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { leerUrlExterna } from "@/Presentation/Components/App/ui/urlExterna.js";
import { BarraDeAvance } from "@/Presentation/Components/Proyecto/avance/BarraDeAvance.jsx";
import { AccionDePerfil } from "@/Presentation/Components/Proyecto/detalle/AccionDePerfil.jsx";
import { FranjaDeDueno } from "@/Presentation/Components/Proyecto/detalle/FranjaDeDueno.jsx";
import { DialogoDePostulacion } from "@/Presentation/Components/Proyecto/detalle/DialogoDePostulacion.jsx";
import {
  idDePostulacion,
  idDeTituloDePerfil,
} from "@/Presentation/Components/Proyecto/alta/idsDePerfil.js";
import { PerfilDelProyecto } from "@/Presentation/Components/Proyecto/detalle/PerfilDelProyecto.jsx";
import { SelloDeBusqueda } from "@/Presentation/Components/Proyecto/SelloDeBusqueda.jsx";
import {
  encajeDelPerfil,
  fechaLarga,
  selloDeProyecto,
} from "@/Presentation/Formatos/proyecto.js";
import { perfilesAbiertos } from "@/Application/Domain/Reglas/busquedaDePerfil.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useEsDuenoDelProyecto } from "@/Presentation/Hooks/proyecto/useEsDuenoDelProyecto.js";
import { useHabilidadesPropias } from "@/Presentation/Hooks/colaboradora/useHabilidadesPropias.js";
import { usePostulacionesEnProyecto } from "@/Presentation/Hooks/postulacion/usePostulacionesEnProyecto.js";
import { usePostulacionEnDetalle } from "@/Presentation/Hooks/postulacion/usePostulacionEnDetalle.js";
import { useProyecto } from "@/Presentation/Hooks/proyecto/useProyecto.js";
import {
  destinoDeVuelta,
  estadoParaVolver,
  RUTA_PROYECTOS,
  rutaAvanceDelProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilosDePerfil from "@/Presentation/Components/Perfil/Perfil.module.css";
import estilos from "./ProyectoPage.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";

export function ProyectoPage() {
  const { id } = useParams();
  return <ProyectoPorId key={id} id={id} />;
}

function ProyectoPorId({ id }) {
  const { usuario, cargando: verificandoSesion } = useAuth();
  const { proyecto, error, recargar } = useProyecto(id);
  const colaboradoraId =
    usuario?.rol === ROL_CUENTA.COLABORADORA ? usuario.perfilId : null;
  const postulaciones = usePostulacionesEnProyecto(colaboradoraId, id);
  const codigosPropios = useHabilidadesPropias(colaboradoraId);

  if (error?.status === 404) {
    return (
      <MensajeDePantalla
        titulo="No encontramos este proyecto"
        tituloDePestana="Proyecto no encontrado"
        volverA={RUTA_PROYECTOS}
        textoVolver="Volver a la búsqueda"
      >
        Puede que el enlace esté mal escrito o que el proyecto ya no esté en la
        plataforma.
      </MensajeDePantalla>
    );
  }
  if (error && !proyecto) {
    return (
      <section className={estilosDePerfil.pagina}>
        <TituloDePagina>Proyecto</TituloDePagina>
        <EstadoDeError
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
      key={colaboradoraId}
      proyecto={proyecto}
      usuario={usuario}
      colaboradoraId={colaboradoraId}
      verificandoSesion={verificandoSesion}
      postulaciones={postulaciones}
      codigosPropios={codigosPropios}
      recargarProyecto={recargar}
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
  recargarProyecto,
}) {
  const location = useLocation();
  const [hoy] = useState(() => new Date());
  const dueno = useEsDuenoDelProyecto(proyecto.id);
  const postulacion = usePostulacionEnDetalle({
    proyecto,
    colaboradoraId,
    postulaciones,
    recargarProyecto,
    buscarDestinoDeFoco: destinoDePostulacion,
  });
  const volver = destinoDeVuelta(location, {
    a: `${RUTA_PROYECTOS}${location.state?.busqueda ?? ""}`,
    texto: "Volver a la búsqueda",
  });
  const sello = selloDeProyecto(proyecto.estado);
  const perfiles = proyecto.perfiles ?? [];
  const abiertos = perfilesAbiertos(proyecto, hoy);
  const historicos = perfiles.filter((perfil) => !abiertos.includes(perfil));
  const esColectivoConPerfiles =
    dueno.esColectivo &&
    perfiles.length > 0 &&
    proyecto.estado !== PROYECTO_ESTADO.FINALIZADO;
  const esperandoAcciones =
    verificandoSesion ||
    (dueno.esDueno === null && !dueno.error) ||
    (colaboradoraId && (postulaciones.cargando || postulacion.actualizando));

  return (
    <article className={estilos.pagina} aria-labelledby="titulo-proyecto">
      <TituloDePagina>{proyecto.titulo}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      {dueno.esDueno && <FranjaDeDueno proyectoId={proyecto.id} />}

      <header className={estilos.encabezado}>
        <div className={estilos.filaDeTitulo}>
          <h1 id="titulo-proyecto" tabIndex={-1}>
            {proyecto.titulo}
          </h1>
          {sello && <SelloDeBusqueda estado={sello} />}
        </div>
        {proyecto.fechaCreacion && (
          <p className={estilosDePerfil.meta}>
            Publicado el{" "}
            <time dateTime={proyecto.fechaCreacion}>
              {fechaLarga(proyecto.fechaCreacion)}
            </time>
          </p>
        )}
        {proyecto.etiquetas?.length > 0 && (
          <ul className={estilosDePerfil.etiquetas} aria-label="Etiquetas">
            {proyecto.etiquetas.map((etiqueta) => (
              <li key={etiqueta} className={estilosDePerfil.etiqueta}>
                {etiqueta}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className={estilos.contenido}>
        <div className={estilos.columna}>
          <section className={estilosDePerfil.panel} aria-labelledby="sobre-el-proyecto">
            <h2 id="sobre-el-proyecto">Sobre este proyecto</h2>
            <TextoConFormato texto={proyecto.descripcion} nivel={3} />
          </section>

          <section
            className={estilosDePerfil.seccion}
            aria-labelledby="perfiles-proyecto"
          >
            <div className={estilos.filaDeTitulo}>
              <h2 id="perfiles-proyecto" tabIndex={-1}>
                Perfiles del proyecto
              </h2>
              {abiertos.length > 0 && (
                <p className={estilos.notaDePostulaciones}>
                  {abiertos.length === 1
                    ? "1 búsqueda abierta"
                    : `${abiertos.length} búsquedas abiertas`}
                </p>
              )}
            </div>
            {dueno.esDueno === false && esColectivoConPerfiles && (
              <p className={estilos.notaDePostulaciones}>
                Las postulaciones son para colaboradoras.
              </p>
            )}
            {postulacion.consultasPendientes.length > 0 && (
              <div className={estilosDePerfil.panel}>
                <p role="alert">
                  Tu postulación se registró. No pudimos actualizar el estado.
                </p>
                <Boton
                  enviando={postulacion.actualizando}
                  textoEnviando="Actualizando…"
                  onClick={() =>
                    postulacion.actualizarEstado(postulacion.consultasPendientes)
                  }
                >
                  Actualizar estado
                </Boton>
              </div>
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
                    <GrupoDePerfiles perfiles={historicos}>
                      {mostrarPerfil}
                    </GrupoDePerfiles>
                  </details>
                )}
              </>
            ) : (
              <p className={estilosDePerfil.vacio}>
                Este proyecto todavía no cargó perfiles.
              </p>
            )}
          </section>
        </div>

        <div className={estilos.columna}>
          {abiertos.length > 0 && !dueno.esColectivo && (
            <section
              className={clases(estilosDePerfil.panel, estilos.invitacion)}
              aria-labelledby="colaborar-en-proyecto"
            >
              <h2 id="colaborar-en-proyecto">¿Te gustaría colaborar?</h2>
              <p>
                Revisá los perfiles abiertos para ver qué habilidades y compromiso
                requiere cada uno.
              </p>
              <Link
                to={{ search: location.search, hash: "#perfiles-proyecto" }}
                state={location.state}
                className={estilosDePerfil.enlace}
              >
                Ver perfiles disponibles <Icono nombre="avanzar" tamano={16} />
              </Link>
            </section>
          )}
          <AvanceDelProyecto proyecto={proyecto} />
        </div>
      </div>

      <DialogoDePostulacion
        perfil={postulacion.aPostular?.perfil ?? null}
        proyecto={proyecto}
        esPublica={postulacion.aPostular?.esPublica ?? true}
        enviando={postulacion.enviando}
        error={postulacion.error}
        alCambiarVisibilidad={postulacion.cambiarVisibilidad}
        alEnviar={postulacion.enviar}
        alCancelar={postulacion.cerrarDialogo}
        destinoDeFoco={postulacion.destinoDeFoco}
      />
    </article>
  );

  function mostrarPerfil(perfil) {
    const propia = postulacion.postulacionDe(perfil.id);
    return (
      <PerfilDelProyecto
        perfil={perfil}
        proyecto={proyecto}
        enDetalle
        codigosPropios={codigosPropios}
        encaje={
          codigosPropios && !propia
            ? encajeDelPerfil(perfil, proyecto, codigosPropios, hoy)
            : null
        }
        hoy={hoy}
      >
        {esperandoAcciones && !propia ? (
          <EsqueletoDeAccion proyecto={proyecto} />
        ) : (
          <AccionDePerfil
            perfil={perfil}
            proyecto={proyecto}
            usuario={usuario}
            postulacion={propia}
            esDueno={dueno.esDueno === true}
            alPostular={postulacion.abrirDialogo}
            hoy={hoy}
          />
        )}
      </PerfilDelProyecto>
    );
  }
}

function destinoDePostulacion(perfilId) {
  const destino =
    document.getElementById(idDePostulacion(perfilId)) ??
    document.getElementById(idDeTituloDePerfil(perfilId));
  const historico = destino?.closest("details");
  if (historico) historico.open = true;
  return destino;
}

function AvanceDelProyecto({ proyecto }) {
  const location = useLocation();
  const porcentaje = proyecto.porcentajeConcrecion;
  const logros = proyecto.logros ?? [];
  const avances = proyecto.avances ?? [];
  const tieneSistema = Boolean(leerUrlExterna(proyecto.urlSistema));
  const tieneRepositorio = Boolean(leerUrlExterna(proyecto.urlRepositorio));

  return (
    <section className={estilosDePerfil.panel} aria-labelledby="titulo-avance">
      <h2 id="titulo-avance">Avance del proyecto</h2>
      {Number.isFinite(porcentaje) ? (
        <BarraDeAvance porcentaje={porcentaje} />
      ) : (
        avances.length === 0 && (
          <p className={estilosDePerfil.vacio}>Todavía no cargó avances.</p>
        )
      )}

      <div className={estilosDePerfil.seccion}>
        <h3>Logros</h3>
        {logros.length > 0 ? (
          <ul className={estilos.registros}>
            {logros.map((logro) => (
              <li key={logro.id}>
                <strong>{logro.titulo}</strong>
                {logro.descripcion && <p>{logro.descripcion}</p>}
                {logro.fecha && (
                  <time dateTime={logro.fecha}>{fechaLarga(logro.fecha)}</time>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={estilosDePerfil.vacio}>Todavía no hay logros registrados.</p>
        )}
      </div>

      {avances.length > 0 && (
        <details className={estilos.historico}>
          <summary>Historial de avances ({avances.length})</summary>
          <ul className={estilos.registros}>
            {avances.map((avance) => (
              <li key={avance.id}>
                {avance.fecha && (
                  <time dateTime={avance.fecha}>{fechaLarga(avance.fecha)}</time>
                )}
                {Number.isFinite(avance.porcentajeConcrecion) && (
                  <p>Avance registrado: {avance.porcentajeConcrecion} %</p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {(tieneSistema || tieneRepositorio) && (
        <ul className={estilos.enlaces}>
          {tieneSistema && (
            <li>
              <EnlaceExterno url={proyecto.urlSistema}>Ver el sistema</EnlaceExterno>
            </li>
          )}
          {tieneRepositorio && (
            <li>
              <EnlaceExterno url={proyecto.urlRepositorio}>
                Ver el repositorio
              </EnlaceExterno>
            </li>
          )}
        </ul>
      )}
      <Link
        to={rutaAvanceDelProyecto(proyecto.id)}
        state={estadoParaVolver(location, "Volver al proyecto")}
        className={estilosDePerfil.enlace}
      >
        Ver el avance completo <Icono nombre="avanzar" tamano={16} />
      </Link>
    </section>
  );
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
      <BloqueEsqueleto ancho="9rem" alto="var(--toque-minimo)" />
    </span>
  );
}

function EsqueletoDelProyecto() {
  return (
    <section className={estilosDePerfil.pagina}>
      <Esqueleto etiqueta="Cargando el proyecto…">
        <div className={estilosDePerfil.seccion}>
          <BloqueEsqueleto ancho="60%" alto="2rem" />
          <BloqueEsqueleto ancho="30%" />
          <BloqueEsqueleto />
          <BloqueEsqueleto ancho="70%" />
          {[1, 2].map((numero) => (
            <div key={numero} className={estilos.esqueletoDePerfil}>
              <BloqueEsqueleto ancho="50%" alto="1.4em" />
              <BloqueEsqueleto ancho="40%" />
              <BloqueEsqueleto />
            </div>
          ))}
        </div>
      </Esqueleto>
    </section>
  );
}
