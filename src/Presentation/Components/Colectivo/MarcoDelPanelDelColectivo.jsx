import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useDatosDelPanel } from "@/Presentation/Hooks/colectivo/usePanelDelColectivo.js";
import { seccionesDelPanelPara } from "@/Presentation/Routes/navegacion.js";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./MarcoDelPanelDelColectivo.module.css";

export function MarcoDelPanelDelColectivo() {
  const { usuario } = useAuth();
  return (
    <PanelConDatos
      key={usuario.perfilId}
      colectivoId={usuario.perfilId}
      secciones={seccionesDelPanelPara(usuario)}
    />
  );
}

function PanelConDatos({ colectivoId, secciones }) {
  const datos = useDatosDelPanel(colectivoId);
  return (
    <div className={estilos.panel}>
      <nav className={estilos.navegacion} aria-label="Secciones del colectivo">
        <ul>
          {secciones.map(({ ruta, texto, icono }) => (
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
