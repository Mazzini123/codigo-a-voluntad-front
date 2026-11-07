import { Link, Navigate, useLocation } from "react-router-dom";
import { Boton } from "../Components/App/Boton.jsx";
import { Campo } from "../Components/App/Campo.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useIngreso } from "../Hooks/useIngreso.js";
import { inicioPorRol } from "../Routes/rutas.js";
import estilos from "./LoginPage.module.css";

export function LoginPage({ registro = false }) {
  const { usuario, ingresoSinConfigurar } = useAuth();
  const { abriendo, abrir } = useIngreso();

  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  const ingresar = (
    <Boton
      key="ingresar"
      variante={registro ? "secundario" : "primario"}
      enviando={abriendo === "ingreso"}
      textoEnviando="Abriendo…"
      disabled={abriendo !== null}
      onClick={() => abrir(false)}
    >
      Ingresar
    </Boton>
  );
  const crearCuenta = (
    <Boton
      key="crear"
      variante={registro ? "primario" : "secundario"}
      enviando={abriendo === "registro"}
      textoEnviando="Abriendo…"
      disabled={abriendo !== null}
      onClick={() => abrir(true)}
    >
      Crear una cuenta
    </Boton>
  );

  return (
    <section className={estilos.login} aria-labelledby="titulo-login">
      <TituloDePagina>{registro ? "Crear una cuenta" : "Ingresar"}</TituloDePagina>
      <div className={estilos.encabezado}>
        <h1 id="titulo-login" tabIndex={-1}>
          {registro
            ? "Creá tu cuenta en Código a Voluntad"
            : "Ingresá a Código a Voluntad"}
        </h1>
        <p className={estilos.bajada}>
          Con una cuenta, los colectivos publican proyectos y buscan colaboradoras, y las
          colaboradoras se postulan a los perfiles que encajan con sus habilidades.
        </p>
      </div>
      {ingresoSinConfigurar ? (
        <AccesoNoDisponible registro={registro} />
      ) : (
        <>
          <div className={estilos.acciones}>
            {registro ? [crearCuenta, ingresar] : [ingresar, crearCuenta]}
          </div>
          <p className={estilos.ayuda}>
            El ingreso se hace en una pantalla segura y después volvés acá.
          </p>
        </>
      )}
    </section>
  );
}

function AccesoNoDisponible({ registro }) {
  const { state } = useLocation();
  return (
    <div className={estilos.vistaPrevia}>
      <p id="estado-acceso" className={estilos.ayuda}>
        El ingreso y el registro todavía no están habilitados. Mientras tanto, podés
        explorar los proyectos sin una cuenta.
      </p>
      <fieldset
        disabled
        className={estilos.campos}
        aria-label={registro ? "Datos de registro" : "Datos de ingreso"}
        aria-describedby="estado-acceso"
      >
        <Campo etiqueta="Correo electrónico" type="email" />
        <Campo etiqueta="Contraseña" type="password" />
        <Boton variante="primario" aria-describedby="estado-acceso">
          {registro ? "Crear una cuenta" : "Ingresar"}
        </Boton>
      </fieldset>
      <div className={estilos.enlaces}>
        <Link to={registro ? "/login" : "/registro"} state={state}>
          {registro ? "Ya tengo una cuenta" : "Crear una cuenta"}
        </Link>
        <Link to="/proyectos">Explorar proyectos</Link>
      </div>
    </div>
  );
}
