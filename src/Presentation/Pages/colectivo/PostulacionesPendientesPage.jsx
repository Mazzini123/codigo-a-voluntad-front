import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { Paginacion } from "@/Presentation/Components/App/navegacion/Paginacion.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import { PostulacionesPorRevisar } from "@/Presentation/Components/Colectivo/PostulacionesPorRevisar.jsx";
import { textoPostulacionesPorRevisar } from "@/Presentation/Formatos/proyecto.js";
import { usePanelDelColectivo } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import panel from "@/Presentation/Components/Colectivo/PanelDelColectivo.module.css";
export function PostulacionesPendientesPage() {
  const { postulacionesRecibidas: consulta } = usePanelDelColectivo();
  return (
    <div className={panel.pagina}>
      <TituloDePagina>Postulaciones pendientes</TituloDePagina>
      <header className={panel.encabezado}>
        <h1 tabIndex={-1}>Postulaciones pendientes</h1>
        <p className={panel.bajada}>
          Revisá las personas que se postularon a los perfiles de tus proyectos.
        </p>
      </header>
      {consulta.error ? (
        <EstadoDeError
          titulo="No pudimos cargar las postulaciones"
          error={consulta.error}
          alReintentar={consulta.reintentar}
        />
      ) : consulta.items ? (
        <section className={panel.panel} aria-label="Postulaciones por revisar">
          <p className={panel.bajada}>
            {textoPostulacionesPorRevisar(consulta.meta?.total ?? consulta.items.length)}
          </p>
          <PostulacionesPorRevisar completo postulaciones={consulta.items} />
          <Paginacion
            pagina={consulta.pagina}
            totalPaginas={consulta.meta?.total_pages ?? 0}
            etiqueta="Páginas de postulaciones pendientes"
            alCambiar={consulta.cambiarPagina}
          />
        </section>
      ) : (
        <p role="status">Cargando las postulaciones…</p>
      )}
    </div>
  );
}
