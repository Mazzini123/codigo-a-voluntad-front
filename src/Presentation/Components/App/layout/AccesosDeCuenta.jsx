import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useIngreso } from "@/Presentation/Hooks/sesion/useIngreso.js";
import estilos from "./AccesosDeCuenta.module.css";
import {
  esRutaDeAcceso,
  RUTA_LOGIN,
  RUTA_REGISTRO,
} from "@/Presentation/Routes/rutas.js";

export function AccesosDeCuenta() {
  const { ingresoSinConfigurar, errorDeCuenta } = useAuth();
  const location = useLocation();
  const { abriendo, abrir } = useIngreso();

  const enPantallaDeAcceso = esRutaDeAcceso(location.pathname);
  if (ingresoSinConfigurar || errorDeCuenta || enPantallaDeAcceso) {
    const desde = enPantallaDeAcceso ? location.state?.desde : location;
    return (
      <div className={estilos.accesos}>
        <Link
          to={RUTA_LOGIN}
          state={{ desde }}
          className={estilos.ingresar}
          aria-current={location.pathname === RUTA_LOGIN ? "page" : undefined}
        >
          Ingresar
        </Link>
        <Link
          to={RUTA_REGISTRO}
          state={{ desde }}
          className={estilos.crear}
          aria-current={location.pathname === RUTA_REGISTRO ? "page" : undefined}
        >
          Crear una cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className={estilos.accesos}>
      <button
        type="button"
        className={estilos.ingresar}
        disabled={abriendo !== null}
        aria-busy={abriendo === "ingreso" || undefined}
        onClick={() => abrir(false)}
      >
        {abriendo === "ingreso" ? "Abriendo…" : "Ingresar"}
      </button>
      <button
        type="button"
        className={estilos.crear}
        disabled={abriendo !== null}
        aria-busy={abriendo === "registro" || undefined}
        onClick={() => abrir(true)}
      >
        {abriendo === "registro" ? "Abriendo…" : "Crear una cuenta"}
      </button>
    </div>
  );
}
