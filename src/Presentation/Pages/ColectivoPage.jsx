import { Link, useLocation, useParams } from "react-router-dom";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { SelloDeBusqueda } from "../Components/Proyecto/SelloDeBusqueda.jsx";
import { textoTipoColectivo, textoUbicacion } from "../Formatos/colectivo.js";
import { selloDeProyecto } from "../Formatos/proyecto.js";
import { useColectivo } from "../Hooks/useColectivo.js";
import { destinoDeVuelta } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";

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
      <section className={estilos.pagina}>
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
          <div className={estilos.seccion}>
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
  return (
    <article className={estilos.pagina} aria-labelledby="nombre-colectivo">
      <TituloDePagina>{colectivo.nombre}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <header className={estilos.titulos}>
        <h1 id="nombre-colectivo" tabIndex={-1}>
          {colectivo.nombre}
        </h1>
        {datos && <p className={estilos.meta}>{datos}</p>}
      </header>
      <p className={estilos.descripcion}>{colectivo.descripcion}</p>

      {colectivo.etiquetas?.length > 0 && (
        <ul className={estilos.etiquetas} aria-label="Etiquetas">
          {colectivo.etiquetas.map((etiqueta) => (
            <li key={etiqueta} className={estilos.etiqueta}>
              {etiqueta}
            </li>
          ))}
        </ul>
      )}

      {colectivo.redesSociales?.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="redes-colectivo">
          <h2 id="redes-colectivo">Redes</h2>
          <ul className={estilos.lista}>
            {colectivo.redesSociales.map((red) => (
              <li key={red.url}>
                <a href={red.url} target="_blank" rel="noopener noreferrer">
                  {red.nombre}
                  <TextoOculto> (se abre en otra pestaña)</TextoOculto>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={estilos.seccion} aria-labelledby="proyectos-colectivo">
        <h2 id="proyectos-colectivo">Proyectos</h2>
        {colectivo.proyectos?.length > 0 ? (
          <ul className={estilos.lista}>
            {colectivo.proyectos.map((proyecto) => (
              <li key={proyecto.id} className={estilos.lineaDeProyecto}>
                <Link to={`/proyectos/${proyecto.id}`} className={estilos.enlaceDeLinea}>
                  {proyecto.titulo}
                </Link>
                {selloDeProyecto(proyecto.estado) && (
                  <SelloDeBusqueda estado={selloDeProyecto(proyecto.estado)} />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={estilos.vacio}>Todavía no publicó proyectos.</p>
        )}
      </section>
    </article>
  );
}
