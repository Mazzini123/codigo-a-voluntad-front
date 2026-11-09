import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { CuerpoDelPanel } from "@/Presentation/Components/Colectivo/CuerpoDelPanel.jsx";
import { postulacionesPorRevisar } from "@/Presentation/Formatos/datosDelPanel.js";
import panel from "@/Presentation/Components/Colectivo/PanelDelColectivo.module.css";
import { PostulacionesPorRevisar } from "@/Presentation/Components/Colectivo/PostulacionesPorRevisar.jsx";
import { textoPostulacionesPorRevisar } from "@/Presentation/Formatos/proyecto.js";

export function PostulacionesPendientesPage() {
  return (
    <div className={panel.pagina}>
      <TituloDePagina>Postulaciones pendientes</TituloDePagina>
      <header className={panel.encabezado}>
        <h1 tabIndex={-1}>Postulaciones pendientes</h1>
        <p className={panel.bajada}>
          Revisá las personas que se postularon a los perfiles de tus proyectos.
        </p>
      </header>
      <CuerpoDelPanel etiquetaDeCarga="Cargando las postulaciones…">
        {(filas) => <ListadoDePostulaciones filas={filas} />}
      </CuerpoDelPanel>
    </div>
  );
}

function ListadoDePostulaciones({ filas }) {
  const { completo, postulaciones } = postulacionesPorRevisar(filas);
  return (
    <section className={panel.panel} aria-label="Postulaciones por revisar">
      {completo && postulaciones.length > 0 && (
        <p className={panel.bajada}>
          {textoPostulacionesPorRevisar(postulaciones.length)}
        </p>
      )}
      <PostulacionesPorRevisar completo={completo} postulaciones={postulaciones} />
    </section>
  );
}
