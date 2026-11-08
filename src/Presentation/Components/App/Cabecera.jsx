import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth.js";
import {
  enlacesPrincipalesPara,
  MINIMO_ENLACES_PARA_MENU,
} from "../../Routes/navegacion.js";
import { Icono } from "./Icono.jsx";
import { MenuDeCuenta } from "./MenuDeCuenta.jsx";
import estilos from "./Cabecera.module.css";
import marca from "./Marca.module.css";

export function Cabecera() {
  const { usuario } = useAuth();
  const enlaces = enlacesPrincipalesPara(usuario?.rol);
  const usaMenu = enlaces.length >= MINIMO_ENLACES_PARA_MENU;
  const [menuAbierto, setMenuAbierto] = useState(false);
  const refBoton = useRef(null);
  const refNavegacion = useRef(null);
  const refCabecera = useRef(null);

  useLayoutEffect(() => {
    if (!window.ResizeObserver) return undefined;
    const raiz = document.documentElement;
    const actualizarAltura = () =>
      raiz.style.setProperty(
        "--alto-cabecera",
        `${refCabecera.current.getBoundingClientRect().height}px`,
      );
    actualizarAltura();
    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(refCabecera.current);
    return () => {
      observador.disconnect();
      raiz.style.removeProperty("--alto-cabecera");
    };
  }, []);

  useEffect(() => {
    if (!menuAbierto) return undefined;
    function cerrarConEscape(evento) {
      if (evento.key !== "Escape") return;
      setMenuAbierto(false);
      refBoton.current?.focus();
    }
    function cerrarAlTocarAfuera(evento) {
      if (!refNavegacion.current?.contains(evento.target)) setMenuAbierto(false);
    }
    document.addEventListener("keydown", cerrarConEscape);
    document.addEventListener("pointerdown", cerrarAlTocarAfuera);
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.removeEventListener("pointerdown", cerrarAlTocarAfuera);
    };
  }, [menuAbierto]);

  function cerrarAlSalirElFoco(evento) {
    const siguiente = evento.relatedTarget;
    if (siguiente && !evento.currentTarget.contains(siguiente)) setMenuAbierto(false);
  }

  return (
    <header ref={refCabecera} className={estilos.cabecera}>
      <div className={`${estilos.barra} ${!usuario ? estilos.visitante : ""}`}>
        <Link to="/" className={estilos.marca} onClick={() => setMenuAbierto(false)}>
          <Icono nombre="codigo" tamano={32} className={marca.simbolo} />
          Código a Voluntad
        </Link>
        <nav ref={refNavegacion} aria-label="Principal" onBlur={cerrarAlSalirElFoco}>
          {usaMenu && (
            <button
              ref={refBoton}
              type="button"
              className={estilos.botonMenu}
              aria-expanded={menuAbierto}
              aria-controls="enlaces-principales"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              <Icono nombre={menuAbierto ? "cruz" : "menu"} />
              <span className={estilos.textoMenu}>Menú</span>
            </button>
          )}
          <ul
            id="enlaces-principales"
            className={`${estilos.enlaces} ${!usaMenu ? estilos.visible : menuAbierto ? estilos.abierto : ""}`}
          >
            {enlaces.map(({ ruta, texto }) => (
              <li key={ruta}>
                <NavLink
                  to={ruta}
                  className={estilos.enlace}
                  onClick={() => setMenuAbierto(false)}
                >
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MenuDeCuenta />
      </div>
    </header>
  );
}
