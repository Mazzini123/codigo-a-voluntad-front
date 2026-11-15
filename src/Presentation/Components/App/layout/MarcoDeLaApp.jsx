import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useFocoAlNavegar } from "@/Presentation/Hooks/comunes/useFocoAlNavegar.js";
import { Cabecera } from "./Cabecera.jsx";
import estilos from "./MarcoDeLaApp.module.css";
import { RUTA_INICIO } from "@/Presentation/Routes/rutas.js";

export function MarcoDeLaApp() {
  const { pathname } = useLocation();
  const refContenido = useRef(null);
  useFocoAlNavegar(refContenido);

  function saltarAlContenido(evento) {
    evento.preventDefault();
    refContenido.current?.focus();
  }

  return (
    <>
      <a href="#contenido" className={estilos.saltar} onClick={saltarAlContenido}>
        Saltar al contenido
      </a>
      <Cabecera />
      <main
        id="contenido"
        ref={refContenido}
        tabIndex={-1}
        className={pathname === RUTA_INICIO ? estilos.inicio : estilos.principal}
      >
        <Outlet />
      </main>
    </>
  );
}
