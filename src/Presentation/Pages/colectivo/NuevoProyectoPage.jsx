import { Navigate } from "react-router-dom";
import { AltaDeProyecto } from "@/Presentation/Components/Proyecto/alta/AltaDeProyecto.jsx";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { PROYECTO_ESTADO } from "@/Application/Domain/Enums/PROYECTO_ESTADO.js";
import {
  MODO_DEL_ALTA,
  useCrearProyecto,
} from "@/Presentation/Hooks/proyecto/useCrearProyecto.js";
import { useTerminosVigentes } from "@/Presentation/Hooks/terminos/useTerminosVigentes.js";
import {
  RUTA_MIS_PROYECTOS,
  RUTA_RESUMEN_COLECTIVO,
  rutaProyecto,
} from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";

function destinoDelAlta(proyecto) {
  return proyecto.estado === PROYECTO_ESTADO.BORRADOR
    ? RUTA_MIS_PROYECTOS
    : rutaProyecto(proyecto.id);
}

export function NuevoProyectoPage() {
  const { usuario } = useAuth();
  const terminos = useTerminosVigentes();
  const alta = useCrearProyecto(usuario.perfilId, {
    alRechazarTerminos: terminos.recargar,
  });

  if (alta.proyecto) return <Navigate to={destinoDelAlta(alta.proyecto)} replace />;

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
        guardandoBorrador={alta.guardandoBorrador}
        esBorrador={alta.modo === MODO_DEL_ALTA.BORRADOR}
        error={alta.error}
        confirmandoNuevaVersion={alta.confirmandoNuevaVersion}
        terminos={terminos}
        alPublicar={alta.publicar}
        alGuardarBorrador={alta.guardarBorrador}
        alReiniciarError={alta.reiniciar}
      />
    </section>
  );
}
