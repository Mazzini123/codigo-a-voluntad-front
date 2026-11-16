import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { seccionesDeAdministracionPara } from "@/Presentation/Routes/navegacion.js";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import estilos from "./MarcoDeAdministracion.module.css";

export function MarcoDeAdministracion() {
  const { usuario } = useAuth();
  const secciones = seccionesDeAdministracionPara(usuario);
  return (
    <div className={estilos.area}>
      {secciones.length > 0 && (
        <nav className={estilos.navegacion} aria-label="Secciones de administración">
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
      )}
      <div className={estilos.contenido}>
        <Outlet />
      </div>
    </div>
  );
}
