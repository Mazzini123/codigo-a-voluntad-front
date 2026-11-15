import { FilaDePostulacion } from "./FilaDePostulacion.jsx";
import estilos from "./PanelDelColectivo.module.css";

export function PostulacionesPorRevisar({ completo, postulaciones, maximo }) {
  const visibles = maximo ? postulaciones.slice(0, maximo) : postulaciones;
  return (
    <>
      {!completo && (
        <p className={estilos.bajada}>
          El listado no incluye las postulaciones de todos los proyectos. Podés
          consultarlas desde cada proyecto.
        </p>
      )}
      {completo && postulaciones.length === 0 && (
        <p className={estilos.bajada}>No hay postulaciones pendientes de revisión.</p>
      )}
      {visibles.length > 0 && (
        <ul className={estilos.lista}>
          {visibles.map(({ proyecto, colaboracion, perfil }) => (
            <li key={`${proyecto.id}-${colaboracion.id}`}>
              <FilaDePostulacion
                proyecto={proyecto}
                colaboracion={colaboracion}
                perfil={perfil}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
