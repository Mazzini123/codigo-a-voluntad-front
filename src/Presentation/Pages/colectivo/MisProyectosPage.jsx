import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { CuerpoDelPanel } from "@/Presentation/Components/Colectivo/CuerpoDelPanel.jsx";
import { FilaDeProyecto } from "@/Presentation/Components/Colectivo/FilaDeProyecto.jsx";
import panel from "@/Presentation/Components/Colectivo/PanelDelColectivo.module.css";
import { usePanelDelColectivo } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import { RUTA_NUEVO_PROYECTO } from "@/Presentation/Routes/rutas.js";
import estilos from "./MisProyectosPage.module.css";

function textoCantidad(cantidad) {
  return cantidad === 1 ? "1 proyecto publicado" : `${cantidad} proyectos publicados`;
}

export function MisProyectosPage() {
  const { nombre, proyectos } = usePanelDelColectivo();
  return (
    <div className={panel.pagina}>
      <TituloDePagina>Mis proyectos</TituloDePagina>
      <header className={estilos.encabezado}>
        <div className={panel.encabezado}>
          <h1 tabIndex={-1}>Mis proyectos</h1>
          <p className={panel.bajada}>
            Administrá los proyectos de {nombre ?? "tu colectivo"}, sus perfiles y
            postulaciones.
          </p>
        </div>
        {proyectos?.length !== 0 && (
          <EnlaceBoton variante="primario" to={RUTA_NUEVO_PROYECTO}>
            Publicar proyecto
          </EnlaceBoton>
        )}
      </header>
      <CuerpoDelPanel etiquetaDeCarga="Cargando tus proyectos…">
        {(filas) => (
          <section className={estilos.listado} aria-label="Listado de proyectos">
            <p className={estilos.cantidad}>{textoCantidad(filas.length)}</p>
            <ul className={estilos.tarjetas}>
              {filas.map(({ proyecto, abiertos, pendientes }) => (
                <li key={proyecto.id} className={estilos.tarjeta}>
                  <FilaDeProyecto
                    nivel={2}
                    proyecto={proyecto}
                    abiertos={abiertos}
                    pendientes={pendientes}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </CuerpoDelPanel>
    </div>
  );
}
