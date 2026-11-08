import { Navigate } from "react-router-dom";
import { Boton } from "../Components/App/Boton.jsx";
import { EnlaceBoton } from "../Components/App/EnlaceBoton.jsx";
import { Icono } from "../Components/App/Icono.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useIngreso } from "../Hooks/useIngreso.js";
import { inicioPorRol } from "../Routes/rutas.js";
import estilos from "./LoginPage.module.css";

export function LoginPage({ registro = false }) {
  const { usuario, ingresoSinConfigurar } = useAuth();
  const { abriendo, abrir } = useIngreso();

  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  const titulo = registro ? "Crear una cuenta" : "Iniciar sesión";
  const accion = registro ? "Crear una cuenta" : "Ingresar";
  const alternativa = registro ? "Ingresar" : "Crear una cuenta";
  const modoActual = registro ? "registro" : "ingreso";
  const modoAlternativo = registro ? "ingreso" : "registro";

  return (
    <section
      className={`${estilos.login} ${ingresoSinConfigurar ? estilos.sinAcceso : ""}`}
      aria-labelledby="titulo-login"
    >
      <TituloDePagina>{registro ? titulo : "Ingresar"}</TituloDePagina>
      <header className={estilos.encabezado}>
        <span className={estilos.simbolo}>
          <Icono nombre="codigo" tamano={32} />
        </span>
        <h1 id="titulo-login" tabIndex={-1}>
          {titulo}
        </h1>
        {!ingresoSinConfigurar && (
          <p className={estilos.bajada}>
            {registro
              ? "Sumate a Código a Voluntad para publicar proyectos o aportar tus habilidades a un colectivo."
              : "Ingresá a tu cuenta de Código a Voluntad para participar en proyectos de impacto social."}
          </p>
        )}
      </header>

      <div className={estilos.acciones}>
        {ingresoSinConfigurar ? (
          <>
            <div className={estilos.aviso}>
              <h2>Acceso a cuentas no disponible</h2>
              <p>El ingreso y el registro todavía no están habilitados.</p>
            </div>
            <EnlaceBoton to="/proyectos" variante="primario">
              Explorar proyectos
            </EnlaceBoton>
          </>
        ) : (
          <>
            <Boton
              variante="primario"
              enviando={abriendo === modoActual}
              textoEnviando="Abriendo…"
              disabled={abriendo !== null}
              onClick={() => abrir(registro)}
            >
              {accion}
            </Boton>
            <p className={estilos.ayuda}>
              Continuá en Logto. Cuando termines, vas a volver a Código a Voluntad.
            </p>
          </>
        )}
      </div>

      {!ingresoSinConfigurar && (
        <div className={estilos.alternativa}>
          <span>{registro ? "¿Ya tenés una cuenta?" : "¿No tenés una cuenta?"}</span>
          <button
            type="button"
            disabled={abriendo !== null}
            aria-busy={abriendo === modoAlternativo || undefined}
            onClick={() => abrir(!registro)}
          >
            {abriendo === modoAlternativo ? "Abriendo…" : alternativa}
          </button>
        </div>
      )}
    </section>
  );
}
