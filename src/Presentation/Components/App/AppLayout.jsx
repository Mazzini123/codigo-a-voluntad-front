import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useFocoAlNavegar } from "../../Hooks/useFocoAlNavegar.js";
import { Cabecera } from "./Cabecera.jsx";
import estilos from "./AppLayout.module.css";

export function AppLayout() {
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
        className={pathname === "/" ? estilos.inicio : estilos.principal}
      >
        <Outlet />
      </main>
    </>
  );
}
