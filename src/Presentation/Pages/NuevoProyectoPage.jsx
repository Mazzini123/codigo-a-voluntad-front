import { Navigate } from "react-router-dom";
import { AltaDeProyecto } from "../Components/Proyecto/AltaDeProyecto.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useCrearProyecto } from "../Hooks/useCrearProyecto.js";
import { RUTA_MIS_PROYECTOS } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";

export function NuevoProyectoPage() {
  const { usuario } = useAuth();
  const alta = useCrearProyecto(usuario.perfilId);

  if (alta.proyecto) return <Navigate to={`/proyectos/${alta.proyecto.id}`} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-nuevo-proyecto">
      <TituloDePagina>Publicar proyecto</TituloDePagina>
      <EnlaceVolver to={RUTA_MIS_PROYECTOS}>Volver a Mis proyectos</EnlaceVolver>
      <div className={estilos.titulos}>
        <h1 id="titulo-nuevo-proyecto" tabIndex={-1}>
          Publicá un proyecto
        </h1>
        <p className={estilos.bajada}>
          Contá qué necesitan y qué perfiles de personas buscan. Lo revisás antes de
          publicarlo.
        </p>
      </div>
      <AltaDeProyecto
        publicando={alta.publicando}
        error={alta.error}
        alPublicar={alta.publicar}
        alReiniciarError={alta.reiniciar}
      />
    </section>
  );
}
