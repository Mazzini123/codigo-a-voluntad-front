import { useLocation, useParams } from "react-router-dom";
import { EmptyState } from "../Components/App/EmptyState.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Icono } from "../Components/App/Icono.jsx";
import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { TarjetaProyecto } from "../Components/Proyecto/TarjetaProyecto.jsx";
import { textoTipoColectivo, textoUbicacion } from "../Formatos/colectivo.js";
import { useColectivo } from "../Hooks/useColectivo.js";
import { destinoDeVuelta } from "../Routes/rutas.js";
import compartidos from "./Perfil.module.css";
import estilos from "./ColectivoPage.module.css";

export function ColectivoPage() {
  const { id } = useParams();
  const { colectivo, error, cargando, recargar } = useColectivo(id);

  if (error?.status === 404 || colectivo?.fechaBaja) {
    return (
      <MensajeDePantalla
        titulo="No encontramos este colectivo"
        tituloDePestana="Colectivo no encontrado"
      >
        Puede que el enlace esté mal escrito o que el colectivo ya no esté en la
        plataforma.
      </MensajeDePantalla>
    );
  }
  if (error) {
    return (
      <section className={compartidos.pagina}>
        <TituloDePagina>Colectivo</TituloDePagina>
        <ErrorState
          nivel={1}
          titulo="No pudimos cargar el colectivo"
          error={error}
          alReintentar={recargar}
        />
      </section>
    );
  }
  if (cargando || !colectivo) {
    return (
      <section className={estilos.pagina}>
        <Skeleton etiqueta="Cargando el colectivo…">
          <div className={compartidos.seccion}>
            <BloqueSkeleton ancho="60%" alto="2rem" />
            <BloqueSkeleton ancho="40%" />
            <BloqueSkeleton />
            <BloqueSkeleton />
            <BloqueSkeleton ancho="70%" />
          </div>
        </Skeleton>
      </section>
    );
  }
  return <PerfilPublico colectivo={colectivo} />;
}

function PerfilPublico({ colectivo }) {
  const volver = destinoDeVuelta(useLocation(), {
    a: "/proyectos",
    texto: "Volver a los proyectos",
  });
  const datos = [
    textoTipoColectivo(colectivo.tipoColectivo),
    textoUbicacion(colectivo.ubicacion),
  ]
    .filter(Boolean)
    .join(" · ");
  const proyectos = colectivo.proyectos ?? [];
  return (
    <article className={estilos.pagina} aria-labelledby="nombre-colectivo">
      <TituloDePagina>{colectivo.nombre}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <header className={estilos.encabezado}>
        <span className={estilos.simbolo}>
          <Icono nombre="personas" tamano={32} />
        </span>
        <div className={estilos.presentacion}>
          <h1 id="nombre-colectivo" tabIndex={-1}>
            {colectivo.nombre}
          </h1>
          {datos && <p className={compartidos.meta}>{datos}</p>}
          {colectivo.descripcion?.trim() && (
            <p className={compartidos.descripcion}>{colectivo.descripcion}</p>
          )}
          {colectivo.etiquetas?.length > 0 && (
            <ul className={compartidos.etiquetas} aria-label="Etiquetas">
              {colectivo.etiquetas.map((etiqueta) => (
                <li key={etiqueta} className={compartidos.etiqueta}>
                  {etiqueta}
                </li>
              ))}
            </ul>
          )}
        </div>
        {colectivo.redesSociales?.length > 0 && (
          <ul className={estilos.redes} aria-label="Redes sociales">
            {colectivo.redesSociales.map((red) => (
              <li key={red.url}>
                <a href={red.url} target="_blank" rel="noopener noreferrer">
                  {red.nombre}
                  <TextoOculto> (se abre en otra pestaña)</TextoOculto>
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className={estilos.seccion} aria-labelledby="proyectos-colectivo">
        <div className={estilos.tituloDeSeccion}>
          <h2 id="proyectos-colectivo">Proyectos del colectivo</h2>
          {proyectos.length > 0 && (
            <p className={compartidos.meta}>
              {proyectos.length === 1 ? "1 proyecto" : `${proyectos.length} proyectos`}
            </p>
          )}
        </div>
        {proyectos.length > 0 ? (
          <ul className={estilos.grilla}>
            {proyectos.map((proyecto) => (
              <li key={proyecto.id}>
                <TarjetaProyecto proyecto={proyecto} estadoAlCostado />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState nivel={3} titulo="Todavía no publicó proyectos." />
        )}
      </section>
    </article>
  );
}
