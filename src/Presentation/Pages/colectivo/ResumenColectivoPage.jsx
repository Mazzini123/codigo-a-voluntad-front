import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TextoOculto } from "@/Presentation/Components/App/ui/TextoOculto.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { CuerpoDelPanel } from "@/Presentation/Components/Colectivo/CuerpoDelPanel.jsx";
import {
  filasParaElResumen,
  postulacionesPorRevisar,
  proyectosActivos,
  totalSiCompleto,
} from "@/Presentation/Formatos/datosDelPanel.js";
import { FilaDeProyecto } from "@/Presentation/Components/Colectivo/FilaDeProyecto.jsx";
import panel from "@/Presentation/Components/Colectivo/PanelDelColectivo.module.css";
import { PostulacionesPorRevisar } from "@/Presentation/Components/Colectivo/PostulacionesPorRevisar.jsx";
import { textoPostulacionesPorRevisar } from "@/Presentation/Formatos/proyecto.js";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { usePanelDelColectivo } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import { enlaceDePerfilPara } from "@/Presentation/Routes/navegacion.js";
import {
  RUTA_MIS_PROYECTOS,
  RUTA_NUEVO_PROYECTO,
  RUTA_POSTULACIONES_COLECTIVO,
} from "@/Presentation/Routes/rutas.js";
import estilos from "./ResumenColectivoPage.module.css";

const MAXIMO_PROYECTOS = 3;
const MAXIMO_POSTULACIONES = 3;

export function ResumenColectivoPage() {
  const { usuario } = useAuth();
  const { nombre, proyectos, error } = usePanelDelColectivo();
  const tieneProyectos = !error && proyectos?.length > 0;
  return (
    <div className={panel.pagina}>
      <TituloDePagina>Resumen del colectivo</TituloDePagina>
      <header className={panel.encabezado}>
        <h1 tabIndex={-1}>Resumen del colectivo</h1>
        {nombre && <p className={panel.nombre}>{nombre}</p>}
        <p className={panel.bajada}>
          Gestioná los proyectos, perfiles y postulaciones de tu colectivo.
        </p>
      </header>
      <CuerpoDelPanel etiquetaDeCarga="Cargando tus proyectos…">
        {(filas) => (
          <>
            <Indicadores filas={filas} />
            <div className={estilos.columnas}>
              <ProyectosDelResumen filas={filas} />
              <PostulacionesDelResumen filas={filas} />
            </div>
          </>
        )}
      </CuerpoDelPanel>
      <section className={panel.panel} aria-labelledby="acciones-colectivo">
        <h2 id="acciones-colectivo">Acciones rápidas</h2>
        <div className={estilos.acciones}>
          {proyectos?.length !== 0 && (
            <EnlaceBoton variante="primario" to={RUTA_NUEVO_PROYECTO}>
              Publicar proyecto
            </EnlaceBoton>
          )}
          {tieneProyectos && (
            <EnlaceBoton to={RUTA_POSTULACIONES_COLECTIVO}>
              Ver postulaciones pendientes
            </EnlaceBoton>
          )}
          <EnlaceBoton to={enlaceDePerfilPara(usuario.rol).ruta}>
            Editar mi colectivo
          </EnlaceBoton>
        </div>
      </section>
    </div>
  );
}

function Indicadores({ filas }) {
  const indicadores = [
    { titulo: "Proyectos activos", valor: proyectosActivos(filas), icono: "carpeta" },
    {
      titulo: "Perfiles abiertos",
      valor: totalSiCompleto(filas, "abiertos"),
      icono: "personas",
    },
    {
      titulo: "Postulaciones pendientes",
      valor: totalSiCompleto(filas, "pendientes"),
      icono: "lista",
    },
  ];
  return (
    <dl className={estilos.indicadores} aria-label="Resumen del colectivo">
      {indicadores
        .filter(({ valor }) => valor !== null)
        .map(({ titulo, valor, icono }) => (
          <div className={estilos.indicador} key={titulo}>
            <dt>
              <span className={estilos.icono}>
                <Icono nombre={icono} tamano={24} />
              </span>
              {titulo}
            </dt>
            <dd>{valor}</dd>
          </div>
        ))}
    </dl>
  );
}

function ProyectosDelResumen({ filas }) {
  return (
    <section className={panel.panel} aria-labelledby="titulo-tus-proyectos">
      <div className={panel.cabeceraDePanel}>
        <div>
          <h2 id="titulo-tus-proyectos">Tus proyectos</h2>
          <p className={panel.bajada}>Gestioná los proyectos de tu colectivo.</p>
        </div>
        <EnlaceBoton to={RUTA_MIS_PROYECTOS}>Ver todos mis proyectos</EnlaceBoton>
      </div>
      <ul className={panel.lista}>
        {filasParaElResumen(filas, MAXIMO_PROYECTOS).map(
          ({ proyecto, abiertos, pendientes }) => (
            <li key={proyecto.id}>
              <FilaDeProyecto
                proyecto={proyecto}
                abiertos={abiertos}
                pendientes={pendientes}
              />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function PostulacionesDelResumen({ filas }) {
  const { completo, postulaciones } = postulacionesPorRevisar(filas);
  return (
    <section className={panel.panel} aria-labelledby="titulo-postulaciones-resumen">
      <div className={panel.cabeceraDePanel}>
        <div>
          <h2 id="titulo-postulaciones-resumen">Postulaciones pendientes</h2>
          {completo && postulaciones.length > 0 && (
            <p className={panel.bajada}>
              {textoPostulacionesPorRevisar(postulaciones.length)}
            </p>
          )}
        </div>
        {postulaciones.length > 0 && (
          <EnlaceBoton to={RUTA_POSTULACIONES_COLECTIVO}>
            Ver todas <TextoOculto>las postulaciones pendientes</TextoOculto>
          </EnlaceBoton>
        )}
      </div>
      <PostulacionesPorRevisar
        completo={completo}
        postulaciones={postulaciones}
        maximo={MAXIMO_POSTULACIONES}
      />
    </section>
  );
}
