import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "./AuthProvider.jsx";
import { AvisosProvider } from "./AvisosProvider.jsx";
import { PieDePagina } from "./PieDePagina.jsx";
import estilos from "./Raiz.module.css";

export function Raiz({ identidad, dependencies }) {
  return (
    <AvisosProvider>
      <div className={estilos.pagina}>
        <AuthProvider identidad={identidad} dependencies={dependencies}>
          <Outlet />
          <ScrollRestoration />
        </AuthProvider>
        <PieDePagina />
      </div>
    </AvisosProvider>
  );
}
