import { Navigate } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { EnlaceBoton } from "@/Presentation/Components/App/ui/EnlaceBoton.jsx";
import { ErrorDeVerificacionDeCuenta } from "@/Presentation/Components/App/sesion/ErrorDeVerificacionDeCuenta.jsx";
import { Icono } from "@/Presentation/Components/App/ui/Icono.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useSesion } from "@/Presentation/Hooks/sesion/useSesion.js";
import { useIngreso } from "@/Presentation/Hooks/sesion/useIngreso.js";
import { inicioPorRol, RUTA_PROYECTOS } from "@/Presentation/Routes/rutas.js";
import estilos from "./LoginPage.module.css";
import { clases } from "@/Presentation/Components/App/ui/clases.js";

export function LoginPage({ registro = false }) {
  const { usuario, ingresoSinConfigurar, errorDeCuenta } = useSesion();
  const { abriendo, abrir } = useIngreso();

  if (errorDeCuenta) return <ErrorDeVerificacionDeCuenta />;
  if (usuario) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  const titulo = registro ? "Crear una cuenta" : "Iniciar sesión";
  const accion = registro ? "Crear una cuenta" : "Ingresar";
  const alternativa = registro ? "Ingresar" : "Crear una cuenta";
  const modoActual = registro ? "registro" : "ingreso";
  const modoAlternativo = registro ? "ingreso" : "registro";

  return (
    <section
      className={clases(estilos.login, ingresoSinConfigurar && estilos.sinAcceso)}
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
            <EnlaceBoton to={RUTA_PROYECTOS} variante="primario">
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
