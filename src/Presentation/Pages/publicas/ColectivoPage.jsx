import { useLocation, useParams } from "react-router-dom";
import { HistoriaDelColectivo } from "@/Presentation/Components/Colectivo/HistoriaDelColectivo.jsx";
import { ValoracionesRecibidas } from "@/Presentation/Components/Valoracion/ValoracionesRecibidas.jsx";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceExterno } from "@/Presentation/Components/App/ui/EnlaceExterno.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { MensajeDePantalla } from "@/Presentation/Components/App/estados/MensajeDePantalla.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { TarjetaProyecto } from "@/Presentation/Components/Proyecto/listado/TarjetaProyecto.jsx";
import { textoTipoColectivo, textoUbicacion } from "@/Presentation/Formatos/colectivo.js";
import { fechaLarga } from "@/Presentation/Formatos/proyecto.js";
import { useColectivo } from "@/Presentation/Hooks/colectivo/useColectivo.js";
import { destinoDeVuelta, RUTA_PROYECTOS } from "@/Presentation/Routes/rutas.js";
import compartidos from "@/Presentation/Components/Perfil/Perfil.module.css";
import estilos from "./ColectivoPage.module.css";
import { TextoConFormato } from "@/Presentation/Components/App/texto/TextoConFormato.jsx";

export function ColectivoPage() {
  const { id } = useParams();
  const { colectivo, error, cargando, recargar } = useColectivo(id);

  if (error?.status === 404) {
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
        <EstadoDeError
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
        <Esqueleto etiqueta="Cargando el colectivo…">
          <div className={compartidos.seccion}>
            <BloqueEsqueleto ancho="60%" alto="2rem" />
            <BloqueEsqueleto ancho="40%" />
            <BloqueEsqueleto />
            <BloqueEsqueleto />
            <BloqueEsqueleto ancho="70%" />
          </div>
        </Esqueleto>
      </section>
    );
  }
  return <PerfilPublico key={id} colectivo={colectivo} />;
}

function PerfilPublico({ colectivo }) {
  const volver = destinoDeVuelta(useLocation(), {
    a: RUTA_PROYECTOS,
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
          {colectivo.fechaBaja && (
            <p className={estilos.baja}>
              Este colectivo se dio de baja el{" "}
              <time dateTime={colectivo.fechaBaja}>
                {fechaLarga(colectivo.fechaBaja)}
              </time>
              . Su historia sigue visible, pero ya no publica proyectos ni recibe
              postulaciones.
            </p>
          )}
          <TextoConFormato texto={colectivo.descripcion} nivel={2} />
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
                <EnlaceExterno url={red.url}>{red.nombre}</EnlaceExterno>
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
          <EstadoVacio
            nivel={3}
            titulo={
              colectivo.fechaBaja
                ? "No publicó proyectos."
                : "Todavía no publicó proyectos."
            }
          />
        )}
      </section>
      <HistoriaDelColectivo id={colectivo.id} />
      <ValoracionesRecibidas id={colectivo.id} esColectivo />
    </article>
  );
}
