import { usePanelDelColectivo } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import { RUTA_NUEVO_PROYECTO } from "@/Presentation/Routes/rutas.js";
import { EstadoVacio } from "@/Presentation/Components/App/estados/EstadoVacio.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { EstadoDeError } from "@/Presentation/Components/App/estados/EstadoDeError.jsx";
import {
  BloqueEsqueleto,
  Esqueleto,
} from "@/Presentation/Components/App/estados/Esqueleto.jsx";
import estilos from "./CuerpoDelPanel.module.css";

export function CuerpoDelPanel({ etiquetaDeCarga, children }) {
  const datos = usePanelDelColectivo();
  const { filas, error, recargar } = datos;
  if (error) {
    return (
      <EstadoDeError
        titulo="No pudimos cargar tus proyectos"
        error={error}
        alReintentar={recargar}
      />
    );
  }
  if (!filas) {
    return (
      <Esqueleto etiqueta={etiquetaDeCarga}>
        <div className={estilos.carga}>
          <BloqueEsqueleto ancho="45%" alto="1.4em" />
          <BloqueEsqueleto />
          <BloqueEsqueleto ancho="70%" />
        </div>
      </Esqueleto>
    );
  }
  if (filas.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no publicaste proyectos"
        descripcion="Un proyecto cuenta qué necesitan y qué perfiles de personas buscan."
      >
        <EnlaceBoton variante="primario" to={RUTA_NUEVO_PROYECTO}>
          Publicar el primero
        </EnlaceBoton>
      </EstadoVacio>
    );
  }
  return children(filas);
}
