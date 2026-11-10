import { useId, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Boton } from "@/Presentation/Components/App/ui/Boton.jsx";
import { Campo } from "@/Presentation/Components/App/ui/Campo.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { useAvisos } from "@/Presentation/Hooks/comunes/useAvisos.js";
import { useNombreDeUsuario } from "@/Presentation/Hooks/sesion/useNombreDeUsuario.js";
import {
  LARGO_MAXIMO_DEL_NOMBRE,
  validarNombreDeUsuario,
} from "@/Presentation/Formularios/cuenta/nombreDeUsuario.js";
import { inicioPorRol, rutaDe } from "@/Presentation/Routes/rutas.js";
import estilos from "./NombrePage.module.css";

export function NombrePage() {
  const { usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const avisar = useAvisos();
  const { ejecutar, enviando, error } = useNombreDeUsuario();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [errorDeCampo, setErrorDeCampo] = useState(null);
  const idTitulo = useId();
  const completando = Boolean(usuario?.nombrePendiente);
  const destino =
    location.state?.volverA ??
    rutaDe(location.state?.desde) ??
    inicioPorRol(usuario?.rol);

  if (!usuario) return <Navigate to="/" replace />;

  async function alEnviar(evento) {
    evento.preventDefault();
    const problema = validarNombreDeUsuario(nombre);
    setErrorDeCampo(problema);
    if (problema) return;
    const resultado = await ejecutar(nombre);
    if (!resultado.ok) return;
    if (completando) {
      navigate(destino, { replace: true });
      return;
    }
    avisar.exito("Cambios guardados.");
  }

  return (
    <section className={estilos.nombre} aria-labelledby={idTitulo}>
      <TituloDePagina>{completando ? "Contanos tu nombre" : "Tu nombre"}</TituloDePagina>
      <h1 id={idTitulo} tabIndex={-1}>
        {completando ? "¿Cómo te llamás?" : "Tu nombre"}
      </h1>
      <p className={estilos.bajada}>
        Es el nombre con el que te van a ver las personas de tus colectivos. Lo guardamos
        nosotros, no tu cuenta de ingreso, y lo podés cambiar cuando quieras.
      </p>
      <form className={estilos.formulario} onSubmit={alEnviar} noValidate>
        <Campo
          etiqueta="Nombre"
          obligatorio
          autoComplete="name"
          maxLength={LARGO_MAXIMO_DEL_NOMBRE}
          value={nombre}
          error={errorDeCampo}
          onChange={(evento) => {
            setNombre(evento.target.value);
            if (errorDeCampo) setErrorDeCampo(null);
          }}
        />
        {error && (
          <p role="alert" className={estilos.error}>
            {error.mensaje}
          </p>
        )}
        <div>
          <Boton
            type="submit"
            variante="primario"
            enviando={enviando}
            textoEnviando="Guardando…"
          >
            {completando ? "Continuar" : "Guardar"}
          </Boton>
        </div>
      </form>
    </section>
  );
}
