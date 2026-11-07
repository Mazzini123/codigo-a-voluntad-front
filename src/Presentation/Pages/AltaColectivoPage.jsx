import { Navigate } from "react-router-dom";
import { ColectivoForm } from "../Components/Colectivo/ColectivoForm.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useCrearColectivo } from "../Hooks/useCrearColectivo.js";
import { inicioPorRol, RUTA_BIENVENIDA } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";

export function AltaColectivoPage() {
  const { usuario } = useAuth();
  const alta = useCrearColectivo();

  if (usuario?.rol) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-alta-colectivo">
      <TituloDePagina>Crear perfil del colectivo</TituloDePagina>
      <EnlaceVolver to={RUTA_BIENVENIDA}>Elegir otro tipo de cuenta</EnlaceVolver>
      <div className={estilos.titulos}>
        <h1 id="titulo-alta-colectivo" tabIndex={-1}>
          Creá el perfil de tu colectivo
        </h1>
        <p className={estilos.bajada}>
          Con estos datos se presentan ante las colaboradoras. Después vas a poder
          publicar proyectos.
        </p>
      </div>
      <ColectivoForm
        esAlta
        textoEnviar="Crear perfil"
        textoEnviando="Creando…"
        enviando={alta.creando}
        errorEnvio={alta.error}
        alEnviar={alta.crear}
      />
    </section>
  );
}
