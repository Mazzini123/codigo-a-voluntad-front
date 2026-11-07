import { useLocation, useParams } from "react-router-dom";
import { Chip } from "../Components/App/Chip.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Icono } from "../Components/App/Icono.jsx";
import { MensajeDePantalla } from "../Components/App/MensajeDePantalla.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TextoOculto } from "../Components/App/TextoOculto.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { nombreVisible } from "../Formatos/colaboradora.js";
import { useColaboradora } from "../Hooks/useColaboradora.js";
import { destinoDeVuelta } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";

export function ColaboradoraPage() {
  const { id } = useParams();
  const { colaboradora, error, cargando, recargar } = useColaboradora(id);

  if (error?.status === 404) {
    return (
      <MensajeDePantalla
        titulo="No encontramos esta colaboradora"
        tituloDePestana="Colaboradora no encontrada"
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
  return <PerfilPublico colaboradora={colaboradora} />;
}

function PerfilPublico({ colaboradora }) {
  const volver = destinoDeVuelta(useLocation(), {
    a: "/proyectos",
    texto: "Volver a los proyectos",
  });
  const nombre = nombreVisible(colaboradora);
  return (
    <article className={estilos.pagina} aria-labelledby="nombre-colaboradora">
      <TituloDePagina>{nombre}</TituloDePagina>
      <EnlaceVolver to={volver.a} state={volver.state}>
        {volver.texto}
      </EnlaceVolver>
      <header className={estilos.titulos}>
        <h1 id="nombre-colaboradora" tabIndex={-1}>
          {nombre}
        </h1>
        {colaboradora.pronombres?.length > 0 && (
          <p className={estilos.meta}>Pronombres: {colaboradora.pronombres.join(", ")}</p>
        )}
      </header>
      {colaboradora.presentacion && (
        <p className={estilos.descripcion}>{colaboradora.presentacion}</p>
      )}
      {colaboradora.cuentaGit && (
        <p className={estilos.meta}>
          Cuenta de GitHub o GitLab: {colaboradora.cuentaGit}
        </p>
      )}
      <p className={estilos.info}>
        <Icono nombre="info" />
        Sus datos de contacto se comparten cuando un colectivo acepta su postulación.
      </p>

      <section className={estilos.seccion} aria-labelledby="habilidades-colaboradora">
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

      {colaboradora.redesSociales?.length > 0 && (
        <section className={estilos.seccion} aria-labelledby="redes-colaboradora">
          <h2 id="redes-colaboradora">Redes</h2>
          <ul className={estilos.lista}>
            {colaboradora.redesSociales.map((red) => (
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
    </article>
  );
}
