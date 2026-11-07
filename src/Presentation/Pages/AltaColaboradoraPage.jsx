import { Navigate } from "react-router-dom";
import { ColaboradoraForm } from "../Components/Colaboradora/ColaboradoraForm.jsx";
import { EnlaceVolver } from "../Components/App/EnlaceVolver.jsx";
import { TituloDePagina } from "../Components/App/TituloDePagina.jsx";
import { useAuth } from "../Hooks/useAuth.js";
import { useCatalogoDeHabilidades } from "../Hooks/useCatalogoDeHabilidades.js";
import { useCrearColaboradora } from "../Hooks/useCrearColaboradora.js";
import { inicioPorRol, RUTA_BIENVENIDA } from "../Routes/rutas.js";
import estilos from "./Perfil.module.css";

export function AltaColaboradoraPage() {
  const { usuario } = useAuth();
  const catalogo = useCatalogoDeHabilidades();
  const alta = useCrearColaboradora();

  if (usuario?.rol) return <Navigate to={inicioPorRol(usuario.rol)} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby="titulo-alta-colaboradora">
      <TituloDePagina>Crear perfil de colaboradora</TituloDePagina>
      <EnlaceVolver to={RUTA_BIENVENIDA}>Elegir otro tipo de cuenta</EnlaceVolver>
      <div className={estilos.titulos}>
        <h1 id="titulo-alta-colaboradora" tabIndex={-1}>
          Creá tu perfil de colaboradora
        </h1>
        <p className={estilos.bajada}>
          Contá qué sabés hacer para encontrar proyectos que encajen con vos.
        </p>
      </div>
      <ColaboradoraForm
        esAlta
        catalogo={catalogo}
        textoEnviar="Crear perfil"
        textoEnviando="Creando…"
        enviando={alta.creando}
        errorEnvio={alta.error}
        alEnviar={alta.crear}
      />
    </section>
  );
}
