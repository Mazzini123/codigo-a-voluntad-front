import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROL_CUENTA } from "../../../Application/Domain/Enums/ROL_CUENTA.js";
import { nombreVisible } from "../../Formatos/colaboradora.js";
import { useAuth } from "../../Hooks/useAuth.js";
import { useColaboradora } from "../../Hooks/useColaboradora.js";
import { useColectivo } from "../../Hooks/useColectivo.js";
import { enlaceDePerfilPara } from "../../Routes/navegacion.js";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { BloqueSkeleton } from "./Skeleton.jsx";
import { AccesosDeCuenta } from "./AccesosDeCuenta.jsx";
import estilos from "./MenuDeCuenta.module.css";

const RUTAS_DE_INGRESO = new Set(["/login", "/registro", "/callback"]);

export function MenuDeCuenta() {
  const { usuario, cargando, cerrarSesion, sesionSimulada } = useAuth();
  const location = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [nombreSolicitado, setNombreSolicitado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const refContenedor = useRef(null);
  const refBoton = useRef(null);
  const destinoDeFoco = useCallback(() => refBoton.current, []);

  useEffect(() => {
    if (!abierto) return undefined;
    function alPresionarTecla(evento) {
      if (evento.key !== "Escape") return;
      setAbierto(false);
      refBoton.current?.focus();
    }
    function alTocarAfuera(evento) {
      if (!refContenedor.current?.contains(evento.target)) setAbierto(false);
    }
    document.addEventListener("keydown", alPresionarTecla);
    document.addEventListener("pointerdown", alTocarAfuera);
    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.removeEventListener("pointerdown", alTocarAfuera);
    };
  }, [abierto]);

  if (cargando) return null;

  if (!usuario) {
    if (RUTAS_DE_INGRESO.has(location.pathname)) return null;
    return <AccesosDeCuenta />;
  }

  const enlaceDePerfil = enlaceDePerfilPara(usuario.rol);

  function alternar() {
    setAbierto((valor) => !valor);
    setNombreSolicitado(true);
  }

  function alSalirElFoco(evento) {
    const siguiente = evento.relatedTarget;
    if (siguiente && !evento.currentTarget.contains(siguiente)) setAbierto(false);
  }

  async function confirmarCierre() {
    setCerrando(true);
    try {
      await cerrarSesion();
    } finally {
      setCerrando(false);
      setConfirmando(false);
    }
  }

  return (
    <div ref={refContenedor} className={estilos.cuenta} onBlur={alSalirElFoco}>
      <button
        ref={refBoton}
        type="button"
        className={estilos.boton}
        aria-expanded={abierto}
        aria-controls="menu-de-cuenta"
        onClick={alternar}
      >
        Mi cuenta
      </button>
      <ul
        id="menu-de-cuenta"
        className={`${estilos.lista} ${abierto ? estilos.abierta : ""}`}
      >
        {nombreSolicitado && enlaceDePerfil && (
          <li className={estilos.nombre}>
            <NombreDeLaCuenta rol={usuario.rol} perfilId={usuario.perfilId} />
          </li>
        )}
        {sesionSimulada && (
          <li className={estilos.nota}>Sesión simulada · {sesionSimulada}</li>
        )}
        {enlaceDePerfil && (
          <li>
            <NavLink
              to={enlaceDePerfil.ruta}
              className={estilos.opcion}
              onClick={() => setAbierto(false)}
            >
              {enlaceDePerfil.texto}
            </NavLink>
          </li>
        )}
        <li>
          <button
            type="button"
            className={estilos.opcion}
            onClick={() => {
              setAbierto(false);
              setConfirmando(true);
            }}
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
      <ConfirmDialog
        abierto={confirmando}
        permanente={false}
        peligroso
        titulo="¿Cerrar sesión?"
        descripcion="Vas a tener que ingresar de nuevo para ver tus proyectos y postulaciones."
        textoConfirmar="Cerrar sesión"
        textoEnviando="Cerrando sesión…"
        enviando={cerrando}
        alConfirmar={confirmarCierre}
        alCancelar={() => setConfirmando(false)}
        destinoDeFoco={destinoDeFoco}
      />
    </div>
  );
}

function NombreDeLaCuenta({ rol, perfilId }) {
  if (rol === ROL_CUENTA.COLECTIVO) return <NombreDeColectivo perfilId={perfilId} />;
  return <NombreDeColaboradora perfilId={perfilId} />;
}

function NombreDeColectivo({ perfilId }) {
  const { colectivo, error } = useColectivo(perfilId);
  return <Nombre texto={colectivo?.nombre} error={error} />;
}

function NombreDeColaboradora({ perfilId }) {
  const { colaboradora, error } = useColaboradora(perfilId);
  return (
    <Nombre texto={colaboradora ? nombreVisible(colaboradora) : null} error={error} />
  );
}

function Nombre({ texto, error }) {
  if (error) return null;
  if (!texto) return <BloqueSkeleton ancho="70%" />;
  return (
    <>
      <span className={estilos.ingresasteComo}>Ingresaste como</span>
      <strong className={estilos.nombreDeLaCuenta}>{texto}</strong>
    </>
  );
}
