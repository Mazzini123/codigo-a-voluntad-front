import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth.js";
import { useIngreso } from "../../Hooks/useIngreso.js";
import estilos from "./AccesosDeCuenta.module.css";

export function AccesosDeCuenta() {
  const { ingresoSinConfigurar } = useAuth();
  const location = useLocation();
  const { abriendo, abrir } = useIngreso();

  const enPantallaDeAcceso = ["/login", "/registro"].includes(location.pathname);
  if (ingresoSinConfigurar || enPantallaDeAcceso) {
    const desde = enPantallaDeAcceso ? location.state?.desde : location;
    return (
      <div className={estilos.accesos}>
        <Link
          to="/login"
          state={{ desde }}
          className={estilos.ingresar}
          aria-current={location.pathname === "/login" ? "page" : undefined}
        >
          Ingresar
        </Link>
        <Link
          to="/registro"
          state={{ desde }}
          className={estilos.crear}
          aria-current={location.pathname === "/registro" ? "page" : undefined}
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
