import { Link } from "react-router-dom";
import { ColectivoForm } from "../Components/Colectivo/ColectivoForm.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { BloqueSkeleton, Skeleton } from "../Components/App/Skeleton.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useActualizarColectivo } from "../Hooks/useActualizarColectivo.js";
import { useAuth } from "../Hooks/useAuth.js";
import { useColectivo } from "../Hooks/useColectivo.js";
import estilos from "./Perfil.module.css";

export function PerfilColectivoPage() {
  const { usuario } = useAuth();
  const consulta = useColectivo(usuario.perfilId);
  const edicion = useActualizarColectivo(usuario.perfilId);
  const colectivo = edicion.guardado ?? consulta.colectivo;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-perfil-colectivo">
      <TituloDePagina>Perfil del colectivo</TituloDePagina>
      <div className={estilos.encabezado}>
        <div className={estilos.titulos}>
          <h1 id="titulo-perfil-colectivo" tabIndex={-1}>
            Perfil del colectivo
          </h1>
          <p className={estilos.bajada}>
            Editá cómo se presentan en la plataforma. Los medios de contacto no son
            públicos.
          </p>
        </div>
        <Link to={`/colectivos/${usuario.perfilId}`} className={estilos.enlace}>
          Ver perfil público
        </Link>
      </div>
      <Contenido consulta={consulta} edicion={edicion} colectivo={colectivo} />
    </section>
  );
}

function Contenido({ consulta, edicion, colectivo }) {
  if (consulta.error) {
    return (
      <ErrorState
        titulo="No pudimos cargar el perfil"
        error={consulta.error}
        alReintentar={consulta.recargar}
      />
    );
  }
  if (!colectivo) {
    return (
      <Skeleton etiqueta="Cargando el perfil…">
        <div className={estilos.panel}>
          <BloqueSkeleton ancho="30%" />
          <BloqueSkeleton alto="2.75rem" />
          <BloqueSkeleton ancho="40%" />
          <BloqueSkeleton alto="6rem" />
          <BloqueSkeleton ancho="30%" />
          <BloqueSkeleton alto="2.75rem" />
        </div>
      </Skeleton>
    );
  }
  return (
    <ColectivoForm
      key={edicion.version}
      colectivo={colectivo}
      esAlta={false}
      textoEnviar="Guardar cambios"
      textoEnviando="Guardando…"
      enviando={edicion.guardando}
      errorEnvio={edicion.error}
      alEnviar={edicion.guardar}
    />
  );
}
