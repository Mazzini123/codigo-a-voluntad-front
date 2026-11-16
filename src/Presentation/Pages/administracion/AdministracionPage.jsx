import { Navigate } from "react-router-dom";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { useAuth } from "@/Presentation/Hooks/sesion/useAuth.js";
import { seccionesDeAdministracionPara } from "@/Presentation/Routes/navegacion.js";
import estilos from "./AdministracionPage.module.css";

export function AdministracionPage() {
  const { usuario } = useAuth();
  const [primera] = seccionesDeAdministracionPara(usuario);
  if (primera) return <Navigate to={primera.ruta} replace />;
  return (
    <div className={estilos.pagina}>
      <TituloDePagina>Administración</TituloDePagina>
      <header className={estilos.encabezado}>
        <h1 tabIndex={-1}>Administración de la plataforma</h1>
        <p>Todavía no hay secciones disponibles para tu cuenta.</p>
      </header>
    </div>
  );
}
