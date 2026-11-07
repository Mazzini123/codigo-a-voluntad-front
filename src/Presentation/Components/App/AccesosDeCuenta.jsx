import { useIngreso } from "../../Hooks/useIngreso.js";
import estilos from "./AccesosDeCuenta.module.css";

export function AccesosDeCuenta() {
  const { ingresoSinConfigurar } = useAuth();
  const desde = useLocation();
  const { abriendo, abrir } = useIngreso();

  if (ingresoSinConfigurar) {
    return (
      <div className={estilos.accesos}>
        <Link to="/login" state={{ desde }} className={estilos.ingresar}>
          Ingresar
        </Link>
        <Link to="/registro" state={{ desde }} className={estilos.crear}>
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
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth.js";
