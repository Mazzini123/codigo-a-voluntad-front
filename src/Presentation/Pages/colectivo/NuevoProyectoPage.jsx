import { Navigate } from "react-router-dom";
import { AltaDeProyecto } from "@/Presentation/Components/Proyecto/alta/AltaDeProyecto.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useCrearProyecto } from "@/Presentation/Hooks/proyecto/useCrearProyecto.js";
import { RUTA_RESUMEN_COLECTIVO, rutaProyecto } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";

export function NuevoProyectoPage() {
  const { usuario } = useAuth();
  const alta = useCrearProyecto(usuario.perfilId);

  if (alta.proyecto) return <Navigate to={rutaProyecto(alta.proyecto.id)} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-nuevo-proyecto">
      <TituloDePagina>Publicar proyecto</TituloDePagina>
      <EnlaceVolver to={RUTA_RESUMEN_COLECTIVO}>
        Volver al panel del colectivo
      </EnlaceVolver>
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
        confirmandoNuevaVersion={alta.confirmandoNuevaVersion}
        alPublicar={alta.publicar}
        alReiniciarError={alta.reiniciar}
      />
    </section>
  );
}
