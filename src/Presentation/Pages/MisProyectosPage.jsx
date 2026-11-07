import { useState } from "react";
import { EmptyState } from "../Components/App/EmptyState.jsx";
import { EnlaceBoton } from "../Components/App/EnlaceBoton.jsx";
import { ErrorState } from "../Components/App/ErrorState.jsx";
import { Skeleton } from "../Components/App/Skeleton.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import {
  TarjetaProyecto,
  TarjetaProyectoSkeleton,
} from "../Components/Proyecto/TarjetaProyecto.jsx";
import { postulacionesPendientes } from "../Formatos/proyecto.js";
import { useAuth } from "../Hooks/useAuth.js";
import { useProyectosDelColectivo } from "../Hooks/useProyectosDelColectivo.js";
import { RUTA_NUEVO_PROYECTO } from "../Routes/rutas.js";
import estilos from "./MisProyectosPage.module.css";

export function MisProyectosPage() {
  const { usuario } = useAuth();
  const { proyectos, error, recargar } = useProyectosDelColectivo(usuario.perfilId);
  const sinProyectos = proyectos?.length === 0;

  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Mis proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <div className={estilos.titulos}>
          <h1 tabIndex={-1}>Mis proyectos</h1>
          <p className={estilos.bajada}>Los proyectos que publicó tu colectivo.</p>
        </div>
        {!sinProyectos && (
          <EnlaceBoton variante="primario" to={RUTA_NUEVO_PROYECTO}>
            Publicar proyecto
          </EnlaceBoton>
        )}
      </header>
      <Contenido proyectos={proyectos} error={error} recargar={recargar} />
    </div>
  );
}

function Contenido({ proyectos, error, recargar }) {
  const [hoy] = useState(() => new Date());

  if (error) {
    return (
      <ErrorState
        titulo="No pudimos cargar tus proyectos"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  if (!proyectos) {
    return (
      <Skeleton etiqueta="Cargando tus proyectos…">
        <ul className={estilos.grilla}>
          {[1, 2, 3, 4, 5, 6].map((numero) => (
            <li key={numero} className={numero > 2 ? estilos.soloEscritorio : undefined}>
              <TarjetaProyectoSkeleton />
            </li>
          ))}
        </ul>
      </Skeleton>
    );
  }
  if (proyectos.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no publicaste proyectos"
        descripcion="Un proyecto cuenta qué necesitan y qué perfiles de personas buscan."
      >
        <EnlaceBoton variante="primario" to={RUTA_NUEVO_PROYECTO}>
          Publicar el primero
        </EnlaceBoton>
      </EmptyState>
    );
  }
  return (
    <section aria-labelledby="titulo-lista-de-proyectos">
      <h2 id="titulo-lista-de-proyectos" className={estilos.oculto}>
        Tus proyectos
      </h2>
      <ul className={estilos.grilla}>
        {proyectos.map((proyecto) => (
          <li key={proyecto.id}>
            <TarjetaProyecto
              proyecto={proyecto}
              propia
              pendientes={postulacionesPendientes(proyecto)}
              hoy={hoy}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
