import { Outlet, ScrollRestoration, useLocation, useMatch } from "react-router-dom";
import { AuthProvider } from "./AuthProvider.jsx";
import { AvisosProvider } from "./AvisosProvider.jsx";
import { PieDePagina } from "./PieDePagina.jsx";
import estilos from "./Raiz.module.css";

export function Raiz({ identidad, dependencies }) {
  const { pathname } = useLocation();
  const esDetalleDeProyecto = useMatch("/proyectos/:id");
  const esColectivoPublico = useMatch("/colectivos/:id");
  const esColaboradoraPublica = useMatch("/colaboradoras/:id");
  const esAcceso = pathname === "/login" || pathname === "/registro";
  const usaFondoCrema =
    pathname === "/proyectos" ||
    esDetalleDeProyecto ||
    esColectivoPublico ||
    esColaboradoraPublica ||
    esAcceso;
  return (
    <AvisosProvider>
      <div
        className={`${estilos.pagina} ${pathname === "/" ? estilos.inicio : ""} ${usaFondoCrema ? estilos.exploracion : ""} ${esAcceso ? estilos.acceso : ""}`}
      >
        <AuthProvider identidad={identidad} dependencies={dependencies}>
          <Outlet />
          <ScrollRestoration />
        </AuthProvider>
        <PieDePagina />
      </div>
    </AvisosProvider>
  );
}
