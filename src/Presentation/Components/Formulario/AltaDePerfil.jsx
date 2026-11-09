import { useId } from "react";
import { Navigate } from "react-router-dom";
import { EnlaceVolver } from "@/Presentation/Components/App/navegacion/EnlaceVolver.jsx";
import { TituloDePagina } from "@/Presentation/Components/App/navegacion/TituloDePagina.jsx";
import { ConfirmacionDeAltaDePerfil } from "./ConfirmacionDeAltaDePerfil.jsx";
import { inicioPorRol, RUTA_BIENVENIDA } from "@/Presentation/Routes/rutas.js";
import estilos from "@/Presentation/Components/Perfil/Perfil.module.css";

export function AltaDePerfil({ alta, tituloDePestana, titulo, bajada, children }) {
  const idTitulo = useId();

  if (alta.rolConfirmado)
    return <Navigate to={inicioPorRol(alta.rolConfirmado)} replace />;

  return (
    <section className={estilos.pagina} aria-labelledby={idTitulo}>
      <TituloDePagina>{tituloDePestana}</TituloDePagina>
      {!alta.perfilCreado && (
        <EnlaceVolver to={RUTA_BIENVENIDA}>Elegir otro tipo de cuenta</EnlaceVolver>
      )}
      <div className={estilos.titulos}>
        <h1 id={idTitulo} tabIndex={-1}>
          {titulo}
        </h1>
        <p className={estilos.bajada}>{bajada}</p>
      </div>
      {alta.perfilCreado ? (
        <ConfirmacionDeAltaDePerfil
          actualizando={alta.actualizando}
          actualizarCuenta={alta.actualizarCuenta}
        />
      ) : (
        children
      )}
    </section>
  );
}
