import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useDatosDelPanel } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import { SECCIONES_DEL_PANEL } from "@/Presentation/Routes/navegacion.js";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./MarcoDelPanelDelColectivo.module.css";

export function MarcoDelPanelDelColectivo() {
  const { usuario } = useAuth();
  return <PanelConDatos key={usuario.perfilId} colectivoId={usuario.perfilId} />;
}

function PanelConDatos({ colectivoId }) {
  const datos = useDatosDelPanel(colectivoId);
  return (
    <div className={estilos.panel}>
      <nav className={estilos.navegacion} aria-label="Secciones del colectivo">
        <ul>
          {SECCIONES_DEL_PANEL.map(({ ruta, texto, icono }) => (
            <li key={ruta}>
              <NavLink to={ruta} className={estilos.enlace}>
                <Icono nombre={icono} tamano={20} />
                {texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={estilos.contenido}>
        <Outlet context={datos} />
      </div>
    </div>
  );
}
